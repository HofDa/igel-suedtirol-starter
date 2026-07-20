import {getTranslations, setRequestLocale} from 'next-intl/server';
import {PageHero} from '@/components/layout/PageHero';

type Props = {params: Promise<{locale: string}>};

export default async function Page({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('privacyPage');
  return (
    <>
      <PageHero title={t('title')} description={t('description')} />
      <section className="container-page py-14">
        <div className="card max-w-3xl p-7">
          <p className="font-semibold text-ink/80">{t('pending')}</p>
        </div>
      </section>
    </>
  );
}
