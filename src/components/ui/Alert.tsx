import { CircleAlert, CircleCheck, FlaskConical, Info, type LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

/**
 * Meldungen benennen immer das Problem und den Ausweg und tragen ein
 * Symbol – nie Farbe allein. Blattgrün (`primary`) ist Handlungsfarbe und
 * kommt hier bewusst nicht vor; Warnungen gehören zu `danger`.
 *
 * `provisional` kennzeichnet Demo- und Platzhalterdaten. Die gestrichelte
 * Kontur ist die sichtbare Aussage „noch kein Nachweis“ (AGENTS.md, Regel 9).
 */
const tones = {
  note: {
    icon: Info,
    className: 'border-transparent bg-well text-ink',
    iconClass: 'text-primary-deep',
  },
  danger: {
    icon: CircleAlert,
    className: 'border-transparent bg-danger-wash text-ink',
    iconClass: 'text-danger',
  },
  success: {
    icon: CircleCheck,
    className: 'border-transparent bg-success-wash text-ink',
    iconClass: 'text-success',
  },
  provisional: {
    icon: FlaskConical,
    className: 'border-dashed border-line-strong bg-transparent text-ink-dim',
    iconClass: 'text-ink-faint',
  },
} as const;

type Props = {
  tone?: keyof typeof tones;
  /** Was ist passiert. */
  children: ReactNode;
  /** Wie es weitergeht – Link oder Schaltfläche. */
  action?: ReactNode;
  /** `alert` unterbricht Screenreader, `status` nicht. Fehler: `alert`. */
  live?: 'alert' | 'status' | 'none';
  icon?: LucideIcon;
  className?: string;
};

export function Alert({ tone = 'note', children, action, live = 'none', icon, className }: Props) {
  const { icon: ToneIcon, className: toneClass, iconClass } = tones[tone];
  const Icon = icon ?? ToneIcon;
  const liveProps =
    live === 'none' ? {} : live === 'alert' ? { role: 'alert' } : { role: 'status' };

  return (
    <div
      {...liveProps}
      className={cn(
        'flex flex-wrap items-start gap-3 rounded-panel border p-4 text-caption',
        toneClass,
        className,
      )}
    >
      <Icon size={20} aria-hidden="true" className={cn('mt-px shrink-0', iconClass)} />
      <div className="min-w-0 flex-1">{children}</div>
      {action}
    </div>
  );
}
