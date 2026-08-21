import {ArrowRight} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {InfoPage} from '@/components/layout/InfoPage';
import {buttonClass} from '@/components/ui/Button';

type Props = {params: Promise<{locale: string}>};

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('resultsPage');
  const items = t.raw('items') as Array<{title: string; text: string}>;
  return (
    <InfoPage
      title={t('title')}
      description={t('description')}
      items={items}
      heroAction={
        <Link href="/karte" className={buttonClass('outline')}>
          {t('mapLink')} <ArrowRight size={18} aria-hidden="true" />
        </Link>
      }
    />
  );
}
