import type {ReactNode} from 'react';
import {cn} from '@/lib/ui/cn';

type Props = {
  /** Was gemessen wurde – z. B. „Koordinaten“, „Belegnummer“. */
  label?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Messwertanzeige: Koordinaten, Belegnummern, Genauigkeiten, Zähler,
 * Rasterreferenzen. Die Festbreitenschrift steht hier für tatsächliche
 * Messung, nicht als technische Verkleidung von Fließtext (DESIGN.md).
 */
export function Readout({label, children, className}: Props) {
  return (
    <span className={cn('inline-flex flex-col gap-0.5', className)}>
      {label && (
        <span className="text-caption font-medium text-ink-faint">{label}</span>
      )}
      <span className="readout text-ink">{children}</span>
    </span>
  );
}
