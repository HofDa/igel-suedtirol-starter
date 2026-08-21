import { cp, mkdtemp, readFile, rename, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const buildRoot = await mkdtemp(join(tmpdir(), 'igel-pages-build-'));
const disabledPaths = [
  `src${sep}proxy.ts`,
  `src${sep}app${sep}api`,
  `src${sep}app${sep}[locale]${sep}admin`,
];
const ignoredRoots = new Set(['.git', '.next', 'node_modules', 'out']);

function includeInStaticBuild(source) {
  const path = relative(projectRoot, source);
  if (!path) return true;
  const [root] = path.split(sep);
  if (ignoredRoots.has(root)) return false;
  if (/^\.env(?:\..*)?\.local$/.test(path) || path === '.env.local') return false;
  if (path === 'igel.zip') return false;
  return !disabledPaths.some(
    (disabledPath) => path === disabledPath || path.startsWith(`${disabledPath}${sep}`),
  );
}

function runNextBuild() {
  const nextBin = join(projectRoot, 'node_modules', 'next', 'dist', 'bin', 'next');
  const child = spawn(process.execPath, [nextBin, 'build', '--webpack'], {
    cwd: buildRoot,
    env: {
      ...process.env,
      GITHUB_PAGES: 'true',
      NEXT_PUBLIC_DEMO_MODE: 'true',
      NEXT_PUBLIC_STATIC_EXPORT: 'true',
    },
    stdio: 'inherit',
  });

  return new Promise((resolvePromise, rejectPromise) => {
    child.on('error', rejectPromise);
    child.on('exit', (code, signal) => {
      if (code === 0) resolvePromise();
      else rejectPromise(new Error(`Next.js Pages build failed (${signal ?? `exit ${code}`}).`));
    });
  });
}

try {
  await cp(projectRoot, buildRoot, { recursive: true, filter: includeInStaticBuild });
  await symlink(join(projectRoot, 'node_modules'), join(buildRoot, 'node_modules'), 'dir');
  await runNextBuild();

  const generatedOut = join(buildRoot, 'out');
  const stagedOut = join(projectRoot, '.pages-out');
  const finalOut = join(projectRoot, 'out');
  await rm(stagedOut, { recursive: true, force: true });
  await cp(generatedOut, stagedOut, { recursive: true });

  const germanMessages = JSON.parse(
    await readFile(join(projectRoot, 'messages', 'de.json'), 'utf8'),
  );
  const rootRedirect = (
    await readFile(join(projectRoot, 'scripts', 'github-pages-index.html'), 'utf8')
  ).replace('{{TITLE}}', germanMessages.common.brand);
  await writeFile(join(stagedOut, 'index.html'), rootRedirect);
  await writeFile(join(stagedOut, '.nojekyll'), '');

  await rm(finalOut, { recursive: true, force: true });
  await rename(stagedOut, finalOut);
} finally {
  await rm(buildRoot, { recursive: true, force: true });
}
