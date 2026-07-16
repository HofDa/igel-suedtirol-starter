import {getTranslations, setRequestLocale} from 'next-intl/server';
import {InfoPage} from '@/components/layout/InfoPage';

type Props = {params: Promise<{locale: string}>};

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hedgehogPage');
  const items = t.raw('items') as Array<{title: string; text: string}>;
  return <InfoPage eyebrow={t('eyebrow')} title={t('title')} description={t('description')} items={items} />;
}
