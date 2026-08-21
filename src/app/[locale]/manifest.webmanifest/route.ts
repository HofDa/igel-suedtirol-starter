import type { MetadataRoute } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';

type Props = { params: Promise<{ locale: string }> };

export const dynamic = 'force-static';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function GET(_request: Request, { params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return new Response(null, { status: 404 });

  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  const metadata = await getTranslations({ locale, namespace: 'metadata' });
  const common = await getTranslations({ locale, namespace: 'common' });
  const manifest: MetadataRoute.Manifest = {
    name: metadata('title'),
    short_name: common('brand'),
    description: metadata('description'),
    lang: locale,
    start_url: `${basePath}/${locale}/`,
    display: 'standalone',
    // Papier und Rinde entsprechen den Rollen des sichtbaren App-Rahmens.
    background_color: '#ffffff',
    theme_color: '#1ea600',
    icons: [
      { src: `${basePath}/icons/icon-192.png`, sizes: '192x192', type: 'image/png' },
      { src: `${basePath}/icons/icon-512.png`, sizes: '512x512', type: 'image/png' },
      {
        src: `${basePath}/icons/maskable-512.png`,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };

  return Response.json(manifest, {
    headers: {
      'content-type': 'application/manifest+json',
      'cache-control': 'public, max-age=3600',
    },
  });
}
