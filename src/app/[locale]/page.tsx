import {ArrowRight, HeartHandshake, MapPinned, ShieldCheck, type LucideIcon} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {StatCard} from '@/components/layout/StatCard';

type Props = {params: Promise<{locale: string}>};

export default async function HomePage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const features: Array<{Icon: LucideIcon; title: string; text: string}> = [
    {Icon: MapPinned, title: 'features.mapTitle', text: 'features.mapText'},
    {Icon: ShieldCheck, title: 'features.protectTitle', text: 'features.protectText'},
    {Icon: HeartHandshake, title: 'features.scienceTitle', text: 'features.scienceText'}
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-ink py-20 text-white md:py-28">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 20px 20px, white 2px, transparent 0)', backgroundSize: '40px 40px'}} />
        <div className="container-page relative grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <p className="font-bold uppercase tracking-[0.2em] text-forest">{t('eyebrow')}</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[1.03] md:text-7xl">{t('title')}</h1>
            <p className="mt-6 max-w-2xl text-xl text-cream/80">{t('intro')}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link href="/melden" className="inline-flex min-h-14 items-center gap-2 rounded-full bg-forest-dark px-7 font-black text-white hover:bg-ink">
                {t('reportButton')} <ArrowRight aria-hidden="true" />
              </Link>
              <Link href="/hilfe" className="inline-flex min-h-14 items-center rounded-full border border-white/30 px-7 font-bold hover:bg-white/10">
                {t('helpButton')}
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-md rounded-[2.5rem] bg-cream p-8 text-ink shadow-2xl">
            <div className="text-8xl" aria-hidden="true">🦔</div>
            <h2 className="mt-4 text-2xl font-black">{t('cardTitle')}</h2>
            <p className="mt-2 text-ink/70">{t('cardText')}</p>
          </div>
        </div>
      </section>

      <section className="container-page -mt-8 relative z-10">
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard value="486" label={t('stats.sightings')} />
          <StatCard value="72" label={t('stats.municipalities')} />
          <StatCard value="38" label={t('stats.roadkills')} />
        </div>
        <p className="mt-3 text-sm font-semibold text-ink/60">{t('stats.demoNote')}</p>
      </section>

      <section className="container-page py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({Icon, title, text}) => (
            <article key={title} className="card p-7">
              <Icon className="text-forest-dark" size={36} aria-hidden="true" />
              <h2 className="mt-5 text-xl font-black text-ink">{t(title)}</h2>
              <p className="mt-2 text-ink/70">{t(text)}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
