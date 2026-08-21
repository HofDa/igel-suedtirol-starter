import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHero} from '@/components/layout/PageHero';
import {Alert} from '@/components/ui/Alert';

type Props = {params: Promise<{locale: string}>};

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('imprintPage');
  return (
    <>
      <PageHero title={t('title')} description={t('description')} />
      <section className="container-reading py-12 md:py-16">
        <Alert tone="provisional">{t('pending')}</Alert>
      </section>
    </>
  );
}
