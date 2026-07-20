import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {params: Promise<{locale: string}>};
const rows = [
  ['IGEL-2026-000486', 'Meran', 'alive', 'new'],
  ['IGEL-2026-000485', 'Bozen', 'dead', 'in_review'],
  ['IGEL-2026-000484', 'Kaltern', 'alive', 'validated']
] as const;

export default async function ReportsPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <section className="container-page py-14">
      <h1 className="text-4xl font-black text-ink">{t('reportsTitle')}</h1>
      <div className="mt-7 overflow-x-auto rounded-2xl border border-ink/10 bg-white">
        <table className="w-full min-w-[650px] text-left">
          <thead className="bg-ink text-white"><tr><th className="p-4">{t('id')}</th><th className="p-4">{t('municipality')}</th><th className="p-4">{t('type')}</th><th className="p-4">{t('status')}</th></tr></thead>
          <tbody>{rows.map(([id, municipality, type, status]) => <tr key={id} className="border-t"><td className="p-4 font-bold">{id}</td><td className="p-4">{municipality}</td><td className="p-4">{t(`types.${type}`)}</td><td className="p-4">{t(`statuses.${status}`)}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
