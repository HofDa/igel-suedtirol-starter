type Props = {
  value: string;
  label: string;
};

export function StatCard({value, label}: Props) {
  return (
    <div className="card p-6">
      <div className="text-3xl font-black text-ink">{value}</div>
      <div className="mt-1 text-sm font-semibold text-ink/65">{label}</div>
    </div>
  );
}
