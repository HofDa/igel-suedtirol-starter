'use client';

import Image from 'next/image';
import {Menu, X} from 'lucide-react';
import {useTranslations} from 'next-intl';
import {useState} from 'react';
import {Link} from '@/i18n/navigation';
import {LanguageSwitcher} from './LanguageSwitcher';

const links = [
  ['map', '/karte'],
  ['hedgehog', '/igel'],
  ['protect', '/schutz'],
  ['help', '/hilfe'],
  ['results', '/ergebnisse'],
  ['project', '/projekt']
] as const;

export function Header() {
  const t = useTranslations('navigation');
  const common = useTranslations('common');
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-cream/95 backdrop-blur">
      <div className="container-page flex min-h-20 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-black text-emerald-950">
          <Image src="/logo-hedgehog.svg" alt="" width={52} height={52} priority />
          <span className="leading-tight">
            {common('brand')}
            <small className="block text-xs font-semibold text-emerald-900/70">{common('organization')}</small>
          </span>
        </Link>

        <nav className="hidden items-center gap-5 lg:flex" aria-label={t('mainLabel')}>
          {links.map(([key, href]) => (
            <Link key={key} href={href} className="text-sm font-semibold hover:text-amber-700">
              {t(key)}
            </Link>
          ))}
          <Link
            href="/melden"
            className="rounded-full bg-emerald-900 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-950"
          >
            {t('report')}
          </Link>
          <LanguageSwitcher />
        </nav>

        <button
          type="button"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-full border border-emerald-950/15 lg:hidden"
          aria-label={open ? t('closeMenu') : t('openMenu')}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <nav className="container-page grid gap-2 pb-5 lg:hidden" aria-label={t('mainLabel')}>
          {links.map(([key, href]) => (
            <Link
              key={key}
              href={href}
              className="rounded-xl px-4 py-3 font-semibold hover:bg-white"
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </Link>
          ))}
          <Link
            href="/melden"
            className="rounded-xl bg-emerald-900 px-4 py-3 font-bold text-white"
            onClick={() => setOpen(false)}
          >
            {t('report')}
          </Link>
          <div className="px-4 py-2">
            <LanguageSwitcher />
          </div>
        </nav>
      )}
    </header>
  );
}
