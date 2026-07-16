import {getTranslations, setRequestLocale} from 'next-intl/server';

type Props = {params: Promise<{locale: string}>};
const rows = [
  ['IGEL-2026-000486', 'Meran', 'alive', 'new'],
  ['IGEL-2026-000485', 'Bozen', 'dead', 'in_review'],
  ['IGEL-2026-000484', 'Kaltern', 'alive', 'validated']
];

export default async function ReportsPage({params}: Props) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('admin');
  return (
    <section className="container-page py-14">
      <h1 className="text-4xl font-black text-emerald-950">{t('reportsTitle')}</h1>
      <div className="mt-7 overflow-x-auto rounded-2xl border border-emerald-950/10 bg-white">
        <table className="w-full min-w-[650px] text-left">
          <thead className="bg-emerald-950 text-white"><tr><th className="p-4">ID</th><th className="p-4">{t('municipality')}</th><th className="p-4">{t('type')}</th><th className="p-4">{t('status')}</th></tr></thead>
          <tbody>{rows.map((row) => <tr key={row[0]} className="border-t"><td className="p-4 font-bold">{row[0]}</td><td className="p-4">{row[1]}</td><td className="p-4">{row[2]}</td><td className="p-4">{row[3]}</td></tr>)}</tbody>
        </table>
      </div>
    </section>
  );
}
