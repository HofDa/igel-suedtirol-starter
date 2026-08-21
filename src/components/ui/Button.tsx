import type {ComponentPropsWithoutRef, ElementType, ReactNode} from 'react';
import {cn} from '@/lib/ui/cn';

/**
 * Die einzige Schaltflächen-Definition der Anwendung.
 *
 * Die Form kommt von der Dachmarke b*nature (0,75 rem Radius), die Farbe aus
 * dem eigenen Projektlogo: gefülltes Blattgrün mit dunkler Beschriftung.
 *
 * `primary` markiert pro Ansicht genau eine
 * Handlung – die, die als Nächstes dran ist. Alles andere ist `outline`
 * (Umriss) oder `quiet` (nur Text). `danger` bleibt zerstörenden oder
 * warnenden Aktionen vorbehalten (siehe DESIGN.md).
 */
export const buttonTones = {
  // Die Haarlinie ist kein Zierrat: das Blattgrün erreicht als Fläche gegen
  // Weiß 3,23:1 und gegen den Sandgrund nur 2,80:1 – unter der 3:1-Schwelle
  // für die Umrisse von Bedienelementen. Mit ihr ist die Kante eindeutig.
  primary:
    'bg-primary text-primary-ink shadow-action ring-1 ring-ink/25 hover:bg-primary-strong active:translate-y-px',
  outline: 'border border-line-strong text-ink hover:bg-well active:translate-y-px',
  quiet: 'text-ink-dim hover:bg-well hover:text-ink',
  danger: 'bg-danger text-surface hover:brightness-110 active:translate-y-px'
} as const;

/** Alle Größen erfüllen die 44-px-Mindestgröße aus AGENTS.md. */
export const buttonSizes = {
  md: 'min-h-11 gap-2 px-4 text-caption',
  lg: 'min-h-12 gap-2 px-5',
  xl: 'min-h-14 gap-2.5 px-7 text-lead'
} as const;

export type ButtonTone = keyof typeof buttonTones;
export type ButtonSize = keyof typeof buttonSizes;

export function buttonClass(tone: ButtonTone = 'primary', size: ButtonSize = 'lg', className?: string) {
  return cn(
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-action font-semibold',
    'transition-[background-color,color,filter,transform] duration-150',
    'disabled:pointer-events-none disabled:opacity-40',
    buttonSizes[size],
    buttonTones[tone],
    className
  );
}

type ButtonProps<T extends ElementType> = {
  as?: T;
  tone?: ButtonTone;
  size?: ButtonSize;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export function Button<T extends ElementType = 'button'>({
  as,
  tone = 'primary',
  size = 'lg',
  className,
  children,
  ...rest
}: ButtonProps<T>) {
  const Component = (as ?? 'button') as ElementType;
  const typeAttribute = Component === 'button' && !('type' in rest) ? {type: 'button' as const} : {};

  return (
    <Component className={buttonClass(tone, size, className)} {...typeAttribute} {...rest}>
      {children}
    </Component>
  );
}
