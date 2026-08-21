import { Check, type LucideIcon } from 'lucide-react';
import type { InputHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/ui/cn';

type Props = {
  type: 'radio' | 'checkbox';
  label: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Kompakte Zeile statt Kachel – für lange Listen wie Verhalten oder Umfeld. */
  compact?: boolean;
  className?: string;
  /** Nimmt die Referenz aus `register()` von react-hook-form auf. */
  ref?: Ref<HTMLInputElement>;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className' | 'ref'>;

/**
 * Auswahlkachel mit sichtbarem Fokus.
 *
 * Das Eingabefeld ist `sr-only`, damit die Kachel selbst gestaltet werden
 * kann. Ohne `has-[:focus-visible]` läge der Fokusring dann auf einem
 * unsichtbaren Element – genau dieser Fehler steckte in der Vorgängerversion.
 * Der Zustand wird zusätzlich durch Kontur und Häkchen gezeigt, nie durch
 * Farbe allein.
 */
export function ChoiceCard({
  type,
  label,
  description,
  icon: Icon,
  compact,
  className,
  ...input
}: Props) {
  return (
    <label
      className={cn(
        'group relative flex cursor-pointer items-center gap-4 rounded-panel border bg-ground',
        'transition-colors duration-150',
        compact ? 'min-h-12 px-4 py-3' : 'min-h-18 p-4',
        'border-line hover:border-line-strong',
        'has-[:checked]:border-primary-deep has-[:checked]:bg-primary-wash',
        'has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-primary-deep',
        'has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-45',
        className,
      )}
    >
      <input type={type} className="sr-only" {...input} />
      {Icon && (
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-surface text-primary-deep">
          <Icon size={compact ? 19 : 22} aria-hidden="true" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block font-semibold text-ink">{label}</span>
        {description && (
          <span className="mt-0.5 block text-caption text-ink-dim">{description}</span>
        )}
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'grid shrink-0 place-items-center border border-line-strong text-primary-ink',
          'transition-colors duration-150',
          // Umriss in Textfarbe, weil das Blattgrün gegen helle Flächen
          // unter 3:1 liegt (siehe DESIGN.md, Regel 3).
          'group-has-[:checked]:border-ink group-has-[:checked]:bg-primary',
          type === 'radio' ? 'size-6 rounded-full' : 'size-6 rounded-md',
        )}
      >
        <Check size={15} strokeWidth={3} className="opacity-0 group-has-[:checked]:opacity-100" />
      </span>
    </label>
  );
}
