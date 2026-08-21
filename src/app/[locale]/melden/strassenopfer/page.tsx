import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PageHero } from '@/components/layout/PageHero';
import { ReportWizard } from '@/components/report/ReportWizard';

export default async function RoadkillReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('roadkillReportPage');
  return (
    <>
      <PageHero title={t('title')} description={t('description')} compact />
      <section className="container-page py-8 md:py-12">
        <ReportWizard mode="roadkill" />
      </section>
    </>
  );
}
