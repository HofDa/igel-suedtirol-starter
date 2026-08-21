import {
  ArrowRight,
  Binoculars,
  Cross,
  Leaf,
  MapPinned,
  ScanSearch,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { buttonClass } from '@/components/ui/Button';
import { BotanicalBackdrop } from '@/components/layout/BotanicalBackdrop';

type Props = { params: Promise<{ locale: string }> };

/** Die Reihenfolge trägt hier Information: melden → prüfen → auswerten. */
const stages: Array<{ key: string; Icon: LucideIcon }> = [
  { key: 'report', Icon: MapPinned },
  { key: 'check', Icon: ScanSearch },
  { key: 'use', Icon: ShieldCheck },
];

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-line bg-band">
        <BotanicalBackdrop className="absolute inset-0 -z-10 h-full w-full opacity-80" />
        <div className="container-page relative py-14 md:py-20 lg:py-24">
          <div className="max-w-3xl">
            <span className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-line bg-surface/85 px-4 text-caption font-semibold text-ink shadow-lifted">
              <Binoculars size={19} className="text-primary-deep" aria-hidden="true" />
              {t('timeHint')}
            </span>
            <h1 className="max-w-[15ch] text-display font-semibold text-balance text-primary-deep md:text-display-lg">
              {t('title')}
            </h1>
            <p className="mt-5 max-w-[54ch] text-lead text-ink-dim">{t('intro')}</p>
          </div>

          {/* Die beiden Wege stehen nebeneinander statt untereinander: das ist
              die im DESIGN.md beschriebene erste Ansicht – zwei unverwechselbar
              verschiedene Handlungen – und sie füllt die Breite, die früher die
              Illustration belegt hat. Der Haarstrich zwischen den Feldern
              trennt sie gestapelt waagerecht und nebeneinander senkrecht. */}
          <div className="mt-10 overflow-hidden rounded-card border border-line bg-surface shadow-lifted lg:grid lg:grid-cols-[1.1fr_0.9fr]">
            <div className="flex flex-col p-6 md:p-8">
              <div className="flex flex-1 items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-primary-wash text-primary-deep">
                  <MapPinned size={21} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-title font-semibold text-ink">{t('science.title')}</h2>
                  <p className="mt-1 max-w-[48ch] text-caption text-ink-dim">{t('science.text')}</p>
                </div>
              </div>
              <Link
                href="/melden"
                className={buttonClass('primary', 'lg', 'mt-6 w-full sm:w-auto sm:self-start')}
              >
                {t('science.action')} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>

            {/* Der SOS-Weg trägt dieselbe Warnfläche wie auf der Meldeauswahl,
                damit beide Einstiege überall gleich aussehen. */}
            <div className="flex flex-col border-t border-line bg-danger-wash p-6 md:p-8 lg:border-l lg:border-t-0">
              <div className="flex flex-1 items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-danger">
                  <Cross size={21} aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-title font-semibold text-ink">{t('help.title')}</h2>
                  <p className="mt-1 max-w-[44ch] text-caption text-ink-dim">{t('help.text')}</p>
                </div>
              </div>
              <Link
                href="/hilfe"
                className={buttonClass('outline', 'lg', 'mt-6 w-full bg-surface sm:w-auto sm:self-start')}
              >
                {t('help.action')} <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
          </div>

          {/* Das Datenschutzversprechen steht als ruhige Zeile unter der
              Auswahl – dieselbe Stelle, an der die Dachmarke ihren
              Vertrauenshinweis unter die Handlungen setzt. */}
          <p className="mt-5 max-w-[58ch] text-caption text-ink-dim">
            <span className="font-semibold text-ink">{t('privacyNote.title')}</span>{' '}
            {t('privacyNote.text')}
          </p>
        </div>
      </section>

      <section className="bg-surface py-20 md:py-28">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <Leaf className="mx-auto text-primary-deep" size={24} aria-hidden="true" />
            <h2 className="mt-4 text-display font-semibold text-balance text-ink">{t('path.title')}</h2>
          </div>
          <ol className="relative mx-auto mt-12 grid max-w-5xl gap-10 md:grid-cols-3 md:gap-12">
            <span
              aria-hidden="true"
              className="absolute left-[16%] right-[16%] top-7 hidden border-t border-line md:block"
            />
            {stages.map(({ key, Icon }, index) => (
              <li key={key} className="relative flex flex-col items-center text-center">
                <span
                  className={
                    index === 0
                      ? 'z-10 grid size-14 place-items-center rounded-full border border-line bg-ground text-primary-deep'
                      : index === 1
                        ? 'z-10 grid size-14 place-items-center rounded-full border border-line bg-ground text-ink'
                        : 'z-10 grid size-14 place-items-center rounded-full border border-line bg-ground text-success'
                  }
                >
                  <Icon size={24} aria-hidden="true" />
                </span>
                <h3 className="mt-5 text-title font-semibold text-ink">{t(`path.${key}.title`)}</h3>
                <p className="mt-3 max-w-[31ch] text-caption text-ink-dim">
                  {t(`path.${key}.text`)}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
