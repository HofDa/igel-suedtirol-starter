import type {MetadataRoute} from 'next';
import {hasLocale} from 'next-intl';
import {getTranslations} from 'next-intl/server';
import {routing} from '@/i18n/routing';

type Props = {params: Promise<{locale: string}>};

export async function GET(_request: Request, {params}: Props) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) return new Response(null, {status: 404});

  const metadata = await getTranslations({locale, namespace: 'metadata'});
  const common = await getTranslations({locale, namespace: 'common'});
  const manifest: MetadataRoute.Manifest = {
    name: metadata('title'),
    short_name: common('brand'),
    description: metadata('description'),
    lang: locale,
    start_url: `/${locale}`,
    display: 'standalone',
    background_color: '#f7f4ec',
    theme_color: '#234936',
    icons: [
      {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png'},
      {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png'},
      {src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'}
    ]
  };

  return Response.json(manifest, {
    headers: {'content-type': 'application/manifest+json', 'cache-control': 'public, max-age=3600'}
  });
}
