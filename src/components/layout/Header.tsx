'use client';

import Image from 'next/image';
import { Menu, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useId, useState } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { buttonClass } from '@/components/ui/Button';
import { withBasePath } from '@/lib/site-path';
import { cn } from '@/lib/ui/cn';
import { LanguageSwitcher } from './LanguageSwitcher';

const links = [
  ['reportHelp', '/melden'],
  ['knowledge', '/igel'],
  ['participate', '/projekt'],
  ['mapResults', '/karte'],
  ['about', '/ueber-uns'],
] as const;

export function Header() {
  const t = useTranslations('navigation');
  const common = useTranslations('common');
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    // Hintergrund nicht mitscrollen lassen, solange das Menü offen ist.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface">
      <div className="container-page flex min-h-18 items-center justify-between gap-3">
        {/* Wortzeichen der Trägerorganisation, daneben der Projektname.
            Das Logo trägt „b*nature“ bereits im Bild, deshalb steht der
            Organisationsname hier nicht noch einmal als Text.

            Die Fläche darunter ist der Schutzraum des Logos: hell ist sie
            weiß und damit im Kopfbereich unsichtbar, dunkel wird sie sandfarben
            und hält die dunkle Igel-Silhouette überhaupt erst lesbar. */}
        <Link
          href="/"
          aria-label={`${common('brand')} – ${common('organization')}`}
          className="flex shrink-0 items-center gap-3 py-2"
        >
          <span className="shrink-0 rounded-well bg-logo-plate px-2 py-1.5">
            <Image
              src={withBasePath('/logo-igelprojekt.png')}
              alt=""
              width={663}
              height={320}
              priority
              className="h-9 w-auto shrink-0"
            />
          </span>
          {/* Auf schmalen Telefonen trägt bereits die Wortmarke den Absender.
              Der ausgeschriebene Projektname würde dort den Menüknopf unter
              die verbindlichen 44 px drücken; ab `sm` ist genug Platz. */}
          <span className="hidden border-l border-line pl-3 font-semibold leading-tight text-ink sm:block xl:hidden 2xl:block">
            {common('brand')}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex" aria-label={t('mainLabel')}>
          {links.map(([key, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'inline-flex min-h-11 items-center whitespace-nowrap rounded-full px-2.5 text-caption transition-colors',
                  // Grün wie in der Navigation der Dachmarke. Der aktive Punkt
                  // wird zusätzlich zur Fläche am Schriftgewicht erkannt, also
                  // nicht allein an der Farbe.
                  active
                    ? 'bg-primary-wash font-semibold text-primary-deep'
                    : 'font-medium text-primary-deep hover:bg-well',
                )}
              >
                {t(key)}
              </Link>
            );
          })}
          <Link href="/melden" className={buttonClass('primary', 'md', 'ml-2')}>
            {t('report')}
          </Link>
          <LanguageSwitcher className="ml-1" />
        </nav>

        <div className="flex items-center gap-2 xl:hidden">
          {/* Italienische Beschriftungen sind auf sehr schmalen Geräten
              länger als der verfügbare Kopfbereich. Dort wandert die
              Meldeaktion ins Menü, damit nichts horizontal überläuft. */}
          <Link
            href="/melden"
            className={buttonClass('primary', 'md', 'hidden min-[360px]:inline-flex')}
          >
            {t('report')}
          </Link>
          <button
            type="button"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-line text-ink hover:bg-well"
            aria-label={open ? t('closeMenu') : t('openMenu')}
            aria-expanded={open}
            aria-controls={menuId}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      <div id={menuId} hidden={!open} className="xl:hidden">
        <nav
          className="container-page grid gap-1 border-t border-line py-4"
          aria-label={t('mainLabel')}
        >
          {links.map(([key, href]) => {
            const active = pathname === href;
            return (
              <Link
                key={key}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-12 items-center rounded-well px-4 transition-colors',
                  active
                    ? 'bg-primary-wash font-semibold text-primary-deep'
                    : 'font-medium text-primary-deep hover:bg-well',
                )}
                onClick={() => setOpen(false)}
              >
                {t(key)}
              </Link>
            );
          })}
          <Link
            href="/melden"
            className={buttonClass('primary', 'md', 'mt-2 min-[360px]:hidden')}
            onClick={() => setOpen(false)}
          >
            {t('report')}
          </Link>
          <div className="mt-2 px-1">
            <LanguageSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
