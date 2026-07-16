type Props = {
  value: string;
  label: string;
};

export function StatCard({value, label}: Props) {
  return (
    <div className="card p-6">
      <div className="text-3xl font-black text-emerald-950">{value}</div>
      <div className="mt-1 text-sm font-semibold text-emerald-950/65">{label}</div>
    </div>
  );
}
