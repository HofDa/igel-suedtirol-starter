import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const resetLocal = process.argv.includes('--reset-local');
const linkedStaging = process.argv.includes('--linked-staging');

function parseSupabaseEnv(output) {
  return Object.fromEntries(
    output
      .split('\n')
      .map((line) => line.match(/^([A-Z0-9_]+)="(.*)"$/))
      .filter(Boolean)
      .map((match) => [match[1], match[2]]),
  );
}

function localSupabaseEnv() {
  return parseSupabaseEnv(
    execFileSync('supabase', ['status', '-o', 'env'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'inherit'],
    }),
  );
}

function linkedStagingEnv() {
  const projectRef = readFileSync(resolve('supabase/.temp/project-ref'), 'utf8').trim();
  const projects = JSON.parse(
    execFileSync('supabase', ['projects', 'list', '--output', 'json'], { encoding: 'utf8' }),
  );
  const project = projects.find((candidate) => candidate.ref === projectRef);
  if (!project || !/staging/i.test(project.name)) {
    throw new Error('The linked Supabase project is not explicitly named as staging.');
  }

  const keys = JSON.parse(
    execFileSync(
      'supabase',
      ['projects', 'api-keys', '--project-ref', projectRef, '--output', 'json'],
      { encoding: 'utf8' },
    ),
  );
  const publishable = keys.find((key) => key.type === 'publishable');
  const authAdmin = keys.find((key) => key.type === 'legacy' && key.name === 'service_role');
  if (!publishable?.api_key || !authAdmin?.api_key) {
    throw new Error('The linked staging project has incomplete API keys.');
  }

  return {
    API_URL: `https://${projectRef}.supabase.co`,
    PUBLISHABLE_KEY: publishable.api_key,
    SERVICE_ROLE_KEY: authAdmin.api_key,
    AUTH_ADMIN_KEY: authAdmin.api_key,
  };
}

let connection = linkedStaging
  ? linkedStagingEnv()
  : {
      API_URL: process.env.SUPABASE_E2E_URL,
      PUBLISHABLE_KEY: process.env.SUPABASE_E2E_PUBLISHABLE_KEY,
      SERVICE_ROLE_KEY: process.env.SUPABASE_E2E_SERVICE_ROLE_KEY,
    };

if (
  !connection.API_URL ||
  !(connection.PUBLISHABLE_KEY || connection.ANON_KEY) ||
  !(connection.SECRET_KEY || connection.SERVICE_ROLE_KEY)
) {
  connection = localSupabaseEnv();
}

const apiUrl = connection.API_URL;
const publishableKey = connection.PUBLISHABLE_KEY ?? connection.ANON_KEY;
const serviceRoleKey = connection.SECRET_KEY ?? connection.SERVICE_ROLE_KEY;

if (!apiUrl || !publishableKey || !serviceRoleKey) {
  throw new Error(
    'Supabase E2E credentials are incomplete. Start the local stack or set SUPABASE_E2E_URL, SUPABASE_E2E_PUBLISHABLE_KEY and SUPABASE_E2E_SERVICE_ROLE_KEY.',
  );
}

const host = new URL(apiUrl).hostname;
const isLoopback = host === '127.0.0.1' || host === 'localhost' || host === '::1';
if (!isLoopback && !linkedStaging && process.env.SUPABASE_E2E_ALLOW_REMOTE !== 'true') {
  throw new Error(
    'Remote E2E runs require SUPABASE_E2E_ALLOW_REMOTE=true. Never point this test at production.',
  );
}

if (resetLocal) {
  if (!isLoopback) throw new Error('--reset-local can only be used with a loopback Supabase URL.');
  execFileSync('supabase', ['db', 'reset'], { stdio: 'inherit' });
  connection = localSupabaseEnv();
}

const result = spawnSync(
  process.execPath,
  [resolve('node_modules/vitest/vitest.mjs'), 'run', 'src/e2e/supabase.e2e.test.ts'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      RUN_SUPABASE_E2E: 'true',
      NEXT_PUBLIC_DEMO_MODE: 'false',
      NEXT_PUBLIC_SUPABASE_URL: connection.API_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: connection.PUBLISHABLE_KEY ?? connection.ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: connection.SECRET_KEY ?? connection.SERVICE_ROLE_KEY,
      SUPABASE_AUTH_ADMIN_KEY:
        connection.AUTH_ADMIN_KEY ?? connection.SECRET_KEY ?? connection.SERVICE_ROLE_KEY,
      SUBMISSION_HASH_SALT: 'local-e2e-only-submission-hash-salt-2026',
    },
  },
);

if (result.error) throw result.error;
process.exit(result.status ?? 1);
