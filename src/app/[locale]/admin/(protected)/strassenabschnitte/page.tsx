import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Alert } from '@/components/ui/Alert';
import { listAdminRoadHazards } from '@/lib/admin/reports';
import {
  isMunicipalityId,
  municipalityName,
} from '@/lib/locations/south-tyrol-municipalities';

export default async function RoadHazardQueue({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  const hazardT = await getTranslations('roadHazard');
  const result = await listAdminRoadHazards();
  return (
    <section className="container-page py-12 md:py-16">
      <h1 className="text-display font-semibold text-ink">{t('roadHazardQueue')}</h1>
      {result.demo && (
        <Alert tone="provisional" className="mt-5 max-w-2xl">
          {t('roadHazardDemoNotice')}
        </Alert>
      )}
      {'error' in result && (
        <Alert tone="danger" className="mt-5 max-w-2xl">
          {t('loadError')}
        </Alert>
      )}
      <div className="mt-6 overflow-x-auto rounded-card border border-line">
        <table className="w-full min-w-[760px] text-left">
          <thead>
            <tr className="bg-well">
              {(
                ['id', 'createdDate', 'municipality', 'roadName', 'hazards', 'status'] as const
              ).map((key) => (
                <th key={key} className="px-4 py-3 text-caption font-semibold text-ink-dim">
                  {t(key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {result.rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 readout">{row.id}</td>
                <td className="px-4 py-3">{row.created}</td>
                <td className="px-4 py-3">
                  {isMunicipalityId(row.municipality)
                    ? municipalityName(row.municipality, locale as 'de' | 'it')
                    : row.municipality}
                </td>
                <td className="px-4 py-3">{result.demo ? t('demoRoadName') : row.roadName}</td>
                <td className="px-4 py-3">
                  {row.hazards.map((hazard) => hazardT(`types.${hazard}`)).join(', ')}
                </td>
                <td className="px-4 py-3">{t(`statuses.${row.status}`)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
