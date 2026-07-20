import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export async function Footer() {
  const t = await getTranslations('footer');
  const common = await getTranslations('common');

  return (
    <footer className="mt-20 bg-ink py-12 text-cream">
      <div className="container-page grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-xl font-black">{common('brand')}</p>
          <p className="mt-2 max-w-sm text-sm text-cream/80">{t('claim')}</p>
        </div>
        <div className="grid content-start gap-2 text-sm">
          <Link href="/projekt" className="inline-flex min-h-11 items-center hover:underline">{t('project')}</Link>
          <Link href="/hilfe" className="inline-flex min-h-11 items-center hover:underline">{t('help')}</Link>
          <Link href="/impressum" className="inline-flex min-h-11 items-center hover:underline">{t('imprint')}</Link>
          <Link href="/datenschutz" className="inline-flex min-h-11 items-center hover:underline">{t('privacy')}</Link>
          <a href="mailto:projekt@example.org" className="inline-flex min-h-11 items-center hover:underline">{t('contact')}</a>
        </div>
        <div className="text-sm text-cream/80">
          <p>{t('privacyPlaceholder')}</p>
        </div>
      </div>
    </footer>
  );
}
