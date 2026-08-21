import {getTranslations, setRequestLocale} from 'next-intl/server';
import {InfoPage} from '@/components/layout/InfoPage';

export default async function AboutPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('aboutPage');
  return <InfoPage title={t('title')} description={t('description')} items={t.raw('items') as Array<{title: string; text: string}>} />;
}
