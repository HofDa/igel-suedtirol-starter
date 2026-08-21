import {cn} from '@/lib/ui/cn';

type Props = {
  value: string;
  label: string;
  /** Kennzeichnet Demowerte als vorläufig – gestrichelt statt durchgezogen. */
  provisional?: boolean;
  className?: string;
};

/**
 * Zahlenanzeige als Messwert, nicht als Held.
 *
 * Die Vorgängerversion eröffnete Seiten mit einer Reihe großer Zahlen über
 * kleinen Beschriftungen. Zahlen, die niemand geprüft hat, sind kein
 * Aufmacher – hier stehen sie in Festbreitenschrift auf Messwertgröße und
 * tragen bei Demodaten sichtbar eine gestrichelte Kontur (AGENTS.md, Regel 9).
 */
export function StatReadout({value, label, provisional, className}: Props) {
  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded-panel border px-4 py-3',
        provisional ? 'border-dashed border-line-strong' : 'border-line bg-well',
        className
      )}
    >
      <span className="readout text-title font-semibold text-ink">{value}</span>
      <span className="text-caption text-ink-dim">{label}</span>
    </div>
  );
}
