import {ArrowRight, CircleAlert, Cross} from 'lucide-react';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import {PageHero} from '@/components/layout/PageHero';
import {Alert} from '@/components/ui/Alert';
import {buttonClass} from '@/components/ui/Button';
import {loadApprovedHelpContacts} from '@/lib/help/contacts';

export default async function HelpPage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('helpPage');
  const signs = t.raw('signs') as string[];
  const contacts = loadApprovedHelpContacts();
  return (
    <>
      <PageHero title={t('title')} description={t('description')} />
      <section className="container-page py-12 md:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div>
            <h2 className="text-section font-semibold text-ink">{t('decisionTitle')}</h2>
            <p className="mt-3 max-w-prose text-ink-dim">{t('decisionText')}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {signs.map((sign) => <li key={sign} className="flex items-start gap-3 rounded-well bg-danger-wash px-4 py-3"><CircleAlert className="shrink-0 text-danger" size={20} aria-hidden="true" /><span className="font-medium text-ink">{sign}</span></li>)}
            </ul>
          </div>
          {/* `self-start`: ohne freigegebene Kontakte ist die Karte kurz. Sie darf
              sich dann nicht auf die Höhe der Merkmalsliste dehnen und als
              großes leeres Feld dastehen. */}
          <aside className="self-start rounded-card border border-line bg-surface p-6">
            <Cross className="text-danger" size={30} aria-hidden="true" />
            <h2 className="mt-4 text-title font-semibold text-ink">{t('contactsTitle')}</h2>
            {contacts.length > 0 ? (
              <ul className="mt-4 grid gap-4">{contacts.map((contact) => <li key={`${contact.name}-${contact.phone ?? contact.email ?? contact.website}`} className="rounded-panel bg-well p-4"><p className="font-semibold text-ink">{contact.name}</p>{contact.area && <p className="mt-1 text-caption text-ink-dim">{contact.area}</p>}{contact.phone && <a className="mt-2 block min-h-11 py-2 font-semibold text-primary-deep underline" href={`tel:${contact.phone}`}>{contact.phone}</a>}{contact.email && <a className="block min-h-11 py-2 text-primary-deep underline" href={`mailto:${contact.email}`}>{contact.email}</a>}{contact.website && <a className="block min-h-11 py-2 text-primary-deep underline" href={contact.website}>{t('contactWebsite')}</a>}</li>)}</ul>
            ) : process.env.NODE_ENV === 'development' ? (
              <Alert tone="provisional" className="mt-4">{t('developmentPlaceholder')}</Alert>
            ) : null}
            <p className="mt-5 text-caption text-ink-dim">{t('notMonitored')}</p>
          </aside>
        </div>
        <div className="mt-14 rounded-card border border-line bg-well p-6 md:p-8">
          <h2 className="text-title font-semibold text-ink">{t('scienceTitle')}</h2>
          <p className="mt-2 max-w-prose text-ink-dim">{t('scienceText')}</p>
          <Link href="/melden/beobachtung" className={buttonClass('outline', 'lg', 'mt-5')}>{t('scienceAction')} <ArrowRight size={18} aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
