'use client';

import {useId, type ReactNode} from 'react';
import {cn} from '@/lib/ui/cn';

/** Gemeinsame Optik für Eingabefeld, Auswahl und Textbereich. */
export function controlClass(className?: string) {
  return cn(
    'w-full rounded-well border border-line bg-well px-4 text-ink',
    'placeholder:text-ink-faint',
    'transition-colors duration-150 hover:border-line-strong',
    'aria-[invalid=true]:border-danger',
    'disabled:cursor-not-allowed disabled:opacity-45',
    className
  );
}

export function inputClass(className?: string) {
  return controlClass(cn('min-h-12', className));
}

type ChildArgs = {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': boolean | undefined;
};

type Props = {
  label: ReactNode;
  /** Erklärt das Feld, bevor etwas schiefgeht. */
  hint?: ReactNode;
  /** Benennt das Problem; der Text sollte auch den Ausweg nennen. */
  error?: ReactNode;
  optional?: boolean;
  optionalLabel?: string;
  className?: string;
  children: (args: ChildArgs) => ReactNode;
};

/**
 * Verknüpft Beschriftung, Hinweis und Fehler korrekt mit dem Bedienelement.
 * Das Bedienelement erhält die IDs über die Render-Funktion, damit die
 * Verbindung nicht von der Verschachtelung abhängt.
 */
export function Field({label, hint, error, optional, optionalLabel, className, children}: Props) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-2 font-semibold text-ink">
        {label}
        {optional && optionalLabel && (
          <span className="text-caption font-normal text-ink-faint">{optionalLabel}</span>
        )}
      </label>
      {hint && (
        <p id={hintId} className="text-caption text-ink-dim">
          {hint}
        </p>
      )}
      {children({id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined})}
      {error && (
        <p id={errorId} role="alert" className="text-caption font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
