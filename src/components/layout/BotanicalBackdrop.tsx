import { cn } from '@/lib/ui/cn';

type Props = {
  className?: string;
  compact?: boolean;
};

/**
 * Rein dekorative Blattsilhouetten. Die Formen bleiben absichtlich ruhig und
 * flach, damit sie Natur vermitteln, ohne mit Inhalten oder Messwerten zu
 * konkurrieren.
 */
export function BotanicalBackdrop({ className, compact = false }: Props) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 760 420"
      className={cn('pointer-events-none select-none', className)}
      preserveAspectRatio="xMidYMid slice"
    >
      <path
        d="M646 11c-95 14-155 84-149 177 77 5 148-27 188-90 24-38 32-68 34-97-22 1-47 4-73 10Z"
        fill="var(--primary)"
        fillOpacity={compact ? 0.09 : 0.12}
      />
      <path
        d="M535 199c45-56 91-102 145-139"
        fill="none"
        stroke="var(--primary-deep)"
        strokeOpacity="0.18"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M57 267c84-21 152 8 189 82-59 42-132 44-190 10-31-18-50-43-66-70 18-9 40-16 67-22Z"
        fill="var(--accent)"
        fillOpacity={compact ? 0.08 : 0.13}
      />
      <path
        d="M16 294c71 7 126 27 189 65"
        fill="none"
        stroke="var(--ink)"
        strokeOpacity="0.12"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {!compact && (
        <g fill="var(--primary-deep)" fillOpacity="0.1">
          <circle cx="397" cy="73" r="5" />
          <circle cx="424" cy="52" r="3" />
          <circle cx="451" cy="79" r="4" />
        </g>
      )}
    </svg>
  );
}
