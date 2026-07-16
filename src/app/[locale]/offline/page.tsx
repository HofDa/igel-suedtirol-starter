import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHero} from '@/components/layout/PageHero';

type Props = {params: Promise<{locale: string}>};
export default async function OfflinePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('offlinePage');
  return <PageHero title={t('title')} description={t('description')} />;
}
