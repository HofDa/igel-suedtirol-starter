import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/layout/PageHero';
import { RoadHazardForm } from '@/components/report/RoadHazardForm';

export default async function RoadHazardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('roadHazardPage');
  return (
    <>
      <PageHero title={t('title')} description={t('description')} compact />
      <section className="container-page py-8 md:py-12">
        <RoadHazardForm />
      </section>
    </>
  );
}
