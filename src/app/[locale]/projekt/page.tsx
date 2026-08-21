import {getTranslations, setRequestLocale} from 'next-intl/server';
import {InfoPage} from '@/components/layout/InfoPage';
import {buttonClass} from '@/components/ui/Button';

type Props = {params: Promise<{locale: string}>};

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('projectPage');
  const items = t.raw('items') as Array<{title: string; text: string}>;
  const iNaturalistUrl = process.env.NEXT_PUBLIC_INATURALIST_PROJECT_URL;
  return <><InfoPage title={t('title')} description={t('description')} items={items} />{iNaturalistUrl && <section className="container-page pb-16"><div className="rounded-card border border-line bg-surface p-6 md:p-8"><h2 className="text-title font-semibold text-ink">{t('inaturalist.title')}</h2><p className="mt-3 max-w-prose text-ink-dim">{t('inaturalist.text')}</p><a href={iNaturalistUrl} rel="noreferrer" className={buttonClass('outline', 'md', 'mt-5')}>{t('inaturalist.action')}</a></div></section>}</>;
}
