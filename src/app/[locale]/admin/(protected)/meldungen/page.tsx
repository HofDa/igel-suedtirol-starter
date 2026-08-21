import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { Alert } from '@/components/ui/Alert';
import { buttonClass } from '@/components/ui/Button';
import { inputClass } from '@/components/ui/Field';
import { listAdminSightings } from '@/lib/admin/reports';
import {
  isMunicipalityId,
  municipalityName,
} from '@/lib/locations/south-tyrol-municipalities';
import { setMediaApproval } from './actions';

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ kind?: string }> };

export default async function ReportsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { kind = 'all' } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const reportT = await getTranslations('report');
  const result = await listAdminSightings(kind);
  return (
    <section className="container-page py-12 md:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-display font-semibold text-ink">{t('reportsTitle')}</h1>
        <Link href="/admin/strassenabschnitte" className={buttonClass('outline')}>
          {t('roadHazardQueue')}
        </Link>
      </div>
      {result.demo && (
        <Alert tone="provisional" className="mt-5 max-w-2xl">
          {t('reportsDemoNote')}
        </Alert>
      )}
      {'error' in result && (
        <Alert tone="danger" className="mt-5 max-w-2xl">
          {t('loadError')}
        </Alert>
      )}
      <form className="mt-6 flex flex-wrap items-end gap-3">
        <label className="grid gap-2 font-semibold text-ink">
          {t('filterKind')}
          <select name="kind" defaultValue={kind} className={inputClass('min-w-56')}>
            {(['all', 'observation', 'roadkill'] as const).map((value) => (
              <option key={value} value={value}>
                {t(`kinds.${value}`)}
              </option>
            ))}
          </select>
        </label>
        <button className={buttonClass('primary', 'md')} type="submit">
          {t('applyFilter')}
        </button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[1280px] border-collapse text-left">
          <caption className="sr-only">{t('reportsTitle')}</caption>
          <thead>
            <tr className="border-b border-line bg-well">
              {(
                [
                  'id',
                  'kind',
                  'observedDate',
                  'createdDate',
                  'time',
                  'municipality',
                  'age',
                  'sex',
                  'habitat',
                  'behavior',
                  'media',
                  'status',
                ] as const
              ).map((key) => (
                <th
                  key={key}
                  scope="col"
                  className="px-3 py-3 text-caption font-semibold text-ink-dim"
                >
                  {t(key)}
                </th>
              ))}
              {result.canViewContacts && (
                <th scope="col" className="px-3 py-3 text-caption font-semibold text-ink-dim">
                  {t('contact')}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-b-0 align-top">
                <td className="px-3 py-3 readout text-ink">{row.id}</td>
                <td className="px-3 py-3">{t(`kinds.${row.kind}`)}</td>
                <td className="px-3 py-3">{row.observed}</td>
                <td className="px-3 py-3">{row.created}</td>
                <td className="px-3 py-3">{row.time || t('unknown')}</td>
                  <td className="px-3 py-3">
                    {isMunicipalityId(row.municipality)
                      ? municipalityName(row.municipality, locale as 'de' | 'it')
                      : row.municipality}
                  </td>
                <td className="px-3 py-3">{reportT(`ageClasses.${row.age}`)}</td>
                <td className="px-3 py-3">{reportT(`sexes.${row.sex}`)}</td>
                <td className="px-3 py-3">{reportT(`habitats.${row.habitat}`)}</td>
                <td className="px-3 py-3">
                  {row.behaviors.map((value) => reportT(`behaviors.${value}`)).join(', ')}
                </td>
                <td className="px-3 py-3">
                  <ul className="grid gap-2">
                    {row.media.length === 0 ? (
                      <li>{t('noMedia')}</li>
                    ) : (
                      row.media.map((media, index) => (
                        <li key={media.id} className="flex items-center gap-2">
                          <span>{t('mediaPosition', { position: index + 1 })}</span>
                          {result.demo ? (
                            <span>{t(media.approved ? 'approved' : 'notApproved')}</span>
                          ) : !media.publicUseApproved ? (
                            <span>{t('noPublicConsent')}</span>
                          ) : (
                            <form action={setMediaApproval}>
                              <input type="hidden" name="mediaId" value={media.id} />
                              <input
                                type="hidden"
                                name="approved"
                                value={String(!media.approved)}
                              />
                              <input type="hidden" name="locale" value={locale} />
                              <button type="submit" className={buttonClass('quiet', 'md')}>
                                {t(media.approved ? 'revokeApproval' : 'approveMedia')}
                              </button>
                            </form>
                          )}
                        </li>
                      ))
                    )}
                  </ul>
                </td>
                <td className="px-3 py-3">{t(`statuses.${row.status}`)}</td>
                {result.canViewContacts && (
                  <td className="px-3 py-3">{row.contact || t('noContact')}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-caption text-ink-dim">{t('contactRoleNotice')}</p>
    </section>
  );
}
