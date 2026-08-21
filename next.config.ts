import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const isGitHubPagesBuild = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.GITHUB_REPOSITORY?.split('/')[1] ?? '';
const pagesBasePath =
  !repositoryName || repositoryName.endsWith('.github.io') ? '' : `/${repositoryName}`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isGitHubPagesBuild
    ? {
        output: 'export',
        trailingSlash: true,
        basePath: pagesBasePath,
        env: {
          NEXT_PUBLIC_BASE_PATH: pagesBasePath,
          NEXT_PUBLIC_STATIC_EXPORT: 'true',
        },
      }
    : {}),
  turbopack: {
    root: process.cwd(),
  },
  images: {
    unoptimized: isGitHubPagesBuild,
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
