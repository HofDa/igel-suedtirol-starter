'use client';

import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import {routing, type Locale} from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');

  return (
    <div className="inline-flex items-center rounded-full border border-emerald-950/15 p-1" role="group" aria-label={t('switchLanguage')}>
      {routing.locales.map((candidate) => (
        <button
          key={candidate}
          type="button"
          onClick={() => router.replace(pathname, {locale: candidate})}
          aria-pressed={candidate === locale}
          lang={candidate}
          className={`min-h-11 min-w-11 rounded-full px-3 text-sm font-bold transition ${
            candidate === locale ? 'bg-emerald-900 text-white' : 'text-emerald-950/70 hover:text-emerald-950'
          }`}
        >
          {candidate.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
