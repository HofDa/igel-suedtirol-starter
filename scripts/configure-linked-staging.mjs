import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const target = resolve('.env.staging.local');
if (existsSync(target) && !process.argv.includes('--force')) {
  throw new Error('.env.staging.local already exists. Use --force to replace it intentionally.');
}

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
const serverKey = keys.find((key) => key.type === 'legacy' && key.name === 'service_role');
if (!publishable?.api_key || !serverKey?.api_key) {
  throw new Error('The linked staging project has incomplete API keys.');
}

const values = [
  `NEXT_PUBLIC_SUPABASE_URL=https://${projectRef}.supabase.co`,
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${publishable.api_key}`,
  `SUPABASE_SERVICE_ROLE_KEY=${serverKey.api_key}`,
  `SUBMISSION_HASH_SALT=${randomBytes(32).toString('hex')}`,
  'NEXT_PUBLIC_DEMO_MODE=false',
  'NEXT_PUBLIC_SITE_URL=http://localhost:3000',
  'NEXT_PUBLIC_MAP_STYLE_URL=https://demotiles.maplibre.org/style.json',
  'NEXT_PUBLIC_INATURALIST_PROJECT_URL=',
  'HELP_CONTACTS_JSON=',
  '',
];

writeFileSync(target, values.join('\n'), { encoding: 'utf8', mode: 0o600 });
process.stdout.write(`Configured ${target} for ${project.name} (${projectRef}).\n`);
