import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHero} from '@/components/layout/PageHero';

type Props = {params: Promise<{locale: string}>};

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('helpPage');
  const items = t.raw('items') as Array<{title: string; text: string}>;
  return (
    <>
      <PageHero eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
      <section className="container-page py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="card p-7">
              <h2 className="text-xl font-black text-emerald-950">{item.title}</h2>
              <p className="mt-3 text-emerald-950/70">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
