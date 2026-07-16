import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHero} from '@/components/layout/PageHero';
import {ReportWizard} from '@/components/report/ReportWizard';

type Props = {params: Promise<{locale: string}>};

export default async function ReportPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('reportPage');

  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
      <section className="container-page py-12 md:py-16">
        <ReportWizard />
      </section>
    </>
  );
}
