import '../globals.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { OfflineStatus } from '@/components/system/OfflineStatus';
import { ServiceWorkerRegistration } from '@/components/system/ServiceWorkerRegistration';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

  return {
    title: {
      default: t('title'),
      template: `%s | ${t('title')}`,
    },
    description: t('description'),
    manifest: `${basePath}/${locale}/manifest.webmanifest`,
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();
  const common = await getTranslations({ locale, namespace: 'common' });

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col">
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main-content"
            className="sr-only fixed left-3 top-3 z-100 rounded-well border border-line bg-surface px-4 py-3 font-semibold shadow-lifted focus:not-sr-only"
          >
            {common('skipToContent')}
          </a>
          <OfflineStatus />
          <Header />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
          <ServiceWorkerRegistration />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
