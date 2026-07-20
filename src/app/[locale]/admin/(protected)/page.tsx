import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {StatCard} from '@/components/layout/StatCard';

type Props = {params: Promise<{locale: string}>};
export default async function AdminPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <section className="container-page py-14">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><p className="font-bold uppercase tracking-widest text-forest-dark">{t('eyebrow')}</p><h1 className="text-4xl font-black text-ink">{t('title')}</h1></div>
        <Link href="/admin/meldungen" className="rounded-full bg-forest-dark px-5 py-3 font-bold text-white">{t('openReports')}</Link>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard value="43" label={t('stats.pending')} />
        <StatCard value="31" label={t('stats.photos')} />
        <StatCard value="4" label={t('stats.duplicates')} />
      </div>
      <p className="mt-3 text-sm font-semibold text-ink/60">{t('statsDemoNote')}</p>
      <p className="mt-8 rounded-xl bg-brand-pink/20 p-4 font-semibold">{t('starterNotice')}</p>
    </section>
  );
}
