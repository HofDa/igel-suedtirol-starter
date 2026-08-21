'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing, type Locale} from '@/i18n/routing';
import {cn} from '@/lib/ui/cn';

type Props = {className?: string};

export function LanguageSwitcher({className}: Props) {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');

  return (
    <div
      className={cn('inline-flex items-center rounded-full border border-line p-0.5', className)}
      role="group"
      aria-label={t('switchLanguage')}
    >
      {routing.locales.map((candidate) => {
        const active = candidate === locale;
        return (
          <button
            key={candidate}
            type="button"
            onClick={() => router.replace(pathname, {locale: candidate})}
            aria-pressed={active}
            aria-label={t(`languageAria.${candidate}`)}
            className={cn(
              'min-h-11 min-w-11 rounded-full px-2 text-caption font-semibold transition-colors',
              // Bewusst keine gefüllte Handlungsfarbe: Das Blattgrün markiert
              // die nächste Handlung, nicht die aktuelle Sprache. Damit die
              // aktive Sprache trotzdem eindeutig ist, tragen drei Merkmale
              // sie gemeinsam – Tönung, Ring und Schriftfarbe. Eine 12-%-
              // Tönung allein war zu leise, um als „ausgewählt" zu lesen.
              active
                ? 'bg-primary-wash text-primary-deep ring-1 ring-inset ring-primary-deep/40'
                : 'text-ink-faint hover:bg-well hover:text-ink'
            )}
          >
            <span lang={candidate}>{t(`languageCompact.${candidate}`)}</span>
          </button>
        );
      })}
    </div>
  );
}
