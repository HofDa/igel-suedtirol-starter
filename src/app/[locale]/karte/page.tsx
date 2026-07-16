import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHero} from '@/components/layout/PageHero';
import {ObservationMap} from '@/components/map/ObservationMap';

type Props = {params: Promise<{locale: string}>};

export default async function MapPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('mapPage');
  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
      <section className="container-page py-12"><ObservationMap /></section>
    </>
  );
}
