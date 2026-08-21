import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {Alert} from '@/components/ui/Alert';
import {buttonClass} from '@/components/ui/Button';
import {StatReadout} from '@/components/layout/StatReadout';

type Props = {params: Promise<{locale: string}>};

export default async function AdminPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');

  return (
    <section className="container-page py-12 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-display font-semibold text-ink">{t('title')}</h1>
        <Link href="/admin/meldungen" className={buttonClass('primary')}>
          {t('openReports')}
        </Link>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatReadout provisional value="43" label={t('stats.pending')} />
        <StatReadout provisional value="31" label={t('stats.photos')} />
        <StatReadout provisional value="4" label={t('stats.duplicates')} />
      </div>
      <p className="mt-3 text-caption text-ink-faint">{t('statsDemoNote')}</p>

      <Alert tone="provisional" className="mt-8 max-w-2xl">
        {t('starterNotice')}
      </Alert>
    </section>
  );
}
