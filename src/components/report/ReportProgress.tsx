type Props = {current: number; total: number; label: string};

export function ReportProgress({current, total, label}: Props) {
  const percent = Math.round((current / total) * 100);
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-bold text-ink/70">
        <span>{label}</span>
        <span aria-hidden="true">{percent}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={current}
        aria-valuetext={label}
        className="h-2 overflow-hidden rounded-full bg-ink/10"
      >
        <div className="h-full rounded-full bg-brand-pink transition-all" style={{width: `${percent}%`}} />
      </div>
    </div>
  );
}
