import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export async function Footer() {
  const t = await getTranslations('footer');
  const common = await getTranslations('common');

  return (
    <footer className="mt-20 bg-emerald-950 py-12 text-emerald-50">
      <div className="container-page grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-xl font-black">{common('brand')}</p>
          <p className="mt-2 max-w-sm text-sm text-emerald-100/80">{t('claim')}</p>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <Link href="/projekt" className="hover:underline">{t('project')}</Link>
          <Link href="/hilfe" className="hover:underline">{t('help')}</Link>
          <Link href="/impressum" className="hover:underline">{t('imprint')}</Link>
          <Link href="/datenschutz" className="hover:underline">{t('privacy')}</Link>
          <a href="mailto:projekt@example.org" className="hover:underline">{t('contact')}</a>
        </div>
        <div className="text-sm text-emerald-100/80">
          <p>{t('privacyPlaceholder')}</p>
        </div>
      </div>
    </footer>
  );
}
