import { spawn } from 'node:child_process';
import { loadEnvFile } from 'node:process';
import { resolve } from 'node:path';

loadEnvFile(resolve('.env.staging.local'));

const child = spawn(
  process.execPath,
  [resolve('node_modules/next/dist/bin/next'), 'dev', '--webpack', ...process.argv.slice(2)],
  { env: process.env, stdio: 'inherit' },
);

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => child.kill(signal));
}

child.on('error', (error) => {
  throw error;
});
child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
