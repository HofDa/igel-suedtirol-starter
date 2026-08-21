import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { withBasePath } from '@/lib/site-path';

const navLinks = [
  ['project', '/projekt'],
  ['help', '/hilfe'],
  ['contact', '/ueber-uns'],
  ['imprint', '/impressum'],
  ['privacy', '/datenschutz'],
] as const;

export async function Footer() {
  const t = await getTranslations('footer');
  const common = await getTranslations('common');

  return (
    <footer className="border-t border-line bg-surface text-ink">
      <div className="container-page py-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(22rem,1fr)] md:items-start md:gap-12">
          <div>
            <span className="inline-flex rounded-panel bg-logo-plate px-3 py-2">
              <Image
                src={withBasePath('/logo-igelprojekt.png')}
                alt=""
                width={663}
                height={320}
                className="h-11 w-auto"
              />
            </span>
            <p className="sr-only">
              {common('brand')} – {common('organization')}
            </p>
            <p className="mt-4 max-w-[42ch] text-caption text-ink-dim">{t('claim')}</p>
          </div>

          <nav
            aria-label={t('navLabel')}
            className="grid grid-cols-2 content-start gap-x-4 sm:grid-cols-3"
          >
            {navLinks.map(([key, href]) => (
              <Link
                key={key}
                href={href}
                className="inline-flex min-h-11 items-center text-caption text-ink-dim hover:text-ink hover:underline"
              >
                {t(key)}
              </Link>
            ))}
          </nav>
        </div>

        <p className="mt-8 border-t border-dashed border-line-strong pt-4 text-caption text-ink-faint">
          {t('privacyPlaceholder')}
        </p>
      </div>
    </footer>
  );
}
