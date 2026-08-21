import { ArrowRight } from 'lucide-react';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageHero } from '@/components/layout/PageHero';
import { ObservationMap } from '@/components/map/ObservationMap';
import { buttonClass } from '@/components/ui/Button';

type Props = { params: Promise<{ locale: string }> };

export default async function MapPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('mapPage');
  return (
    <>
      <PageHero title={t('title')} description={t('description')}>
        <Link href="/ergebnisse" className={buttonClass('outline')}>
          {t('resultsLink')} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </PageHero>
      <section className="container-page py-10 md:py-14">
        <ObservationMap />
      </section>
    </>
  );
}
