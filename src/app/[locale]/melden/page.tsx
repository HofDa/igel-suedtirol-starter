import {
  ArrowRight,
  Cross,
  FlaskConical,
  MapPinned,
  Route,
  Skull,
  type LucideIcon,
} from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageHero } from '@/components/layout/PageHero';

type Props = { params: Promise<{ locale: string }> };
const choices: Array<{
  key: string;
  href: '/melden/beobachtung' | '/melden/strassenopfer' | '/melden/strassenabschnitt' | '/hilfe';
  Icon: LucideIcon;
  help?: boolean;
}> = [
  { key: 'observation', href: '/melden/beobachtung', Icon: MapPinned },
  { key: 'roadkill', href: '/melden/strassenopfer', Icon: Skull },
  { key: 'roadHazard', href: '/melden/strassenabschnitt', Icon: Route },
  { key: 'help', href: '/hilfe', Icon: Cross, help: true },
];

export default async function ReportChoicePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('reportChoice');
  return (
    <>
      <PageHero title={t('title')} description={t('description')} />
      <section className="container-page py-12 md:py-16">
        <div className="mx-auto max-w-4xl overflow-hidden rounded-card border border-line bg-surface shadow-lifted">
          {choices.map(({ key, href, Icon, help }, index) => (
            <Link
              key={key}
              href={href}
              className={`group grid min-h-36 gap-4 p-5 transition-colors hover:bg-well focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary-deep sm:grid-cols-[3rem_1fr_auto] sm:items-center sm:p-6 ${index > 0 ? 'border-t border-line' : ''} ${help ? 'bg-danger-wash' : ''}`}
            >
              <span
                className={`grid size-12 place-items-center rounded-full ${help ? 'bg-surface text-danger' : 'bg-primary-wash text-primary-deep'}`}
              >
                <Icon size={23} aria-hidden="true" />
              </span>
              <span>
                <span className="block text-title font-semibold text-ink">{t(`${key}.title`)}</span>
                <span className="mt-1 block max-w-[58ch] text-caption text-ink-dim">
                  {t(`${key}.text`)}
                </span>
              </span>
              <span className="inline-flex min-h-11 items-center gap-2 font-semibold text-ink sm:pl-5">
                {t(`${key}.action`)}{' '}
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="transition-transform group-hover:translate-x-1"
                />
              </span>
            </Link>
          ))}
        </div>
        <p className="mx-auto mt-6 flex max-w-4xl items-start gap-2 text-caption text-ink-dim">
          <FlaskConical size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          {t('scienceNote')}
        </p>
      </section>
    </>
  );
}
