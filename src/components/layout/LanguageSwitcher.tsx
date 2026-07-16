'use client';

import {Languages} from 'lucide-react';
import {useLocale, useTranslations} from 'next-intl';
import {usePathname, useRouter} from '@/i18n/navigation';
import type {Locale} from '@/i18n/routing';

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations('navigation');
  const nextLocale: Locale = locale === 'de' ? 'it' : 'de';

  return (
    <button
      type="button"
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-emerald-950/15 px-3 text-sm font-bold"
      onClick={() => router.replace(pathname, {locale: nextLocale})}
      aria-label={t('switchLanguage')}
    >
      <Languages size={18} aria-hidden="true" />
      {nextLocale.toUpperCase()}
    </button>
  );
}
