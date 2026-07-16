type Props = {current: number; total: number; label: string};

export function ReportProgress({current, total, label}: Props) {
  const percent = Math.round((current / total) * 100);
  return (
    <div aria-label={label}>
      <div className="mb-2 flex justify-between text-sm font-bold text-emerald-950/70">
        <span>{label}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-emerald-950/10">
        <div className="h-full rounded-full bg-amber-600 transition-all" style={{width: `${percent}%`}} />
      </div>
    </div>
  );
}
