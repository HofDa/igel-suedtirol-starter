import type { ElementType, ReactNode } from 'react';
import { cn } from '@/lib/ui/cn';

type Props = {
  as?: ElementType;
  /** `raised` hebt sich vom Grund ab, `inset` liegt darin (Formularfelder, Listen). */
  variant?: 'raised' | 'inset';
  className?: string;
  children: ReactNode;
};

/**
 * Tiefe entsteht über Helligkeit (ground → surface → well), nicht über
 * farbige Halos. Panels werden nicht ineinander verschachtelt.
 */
export function Panel({ as: Component = 'div', variant = 'raised', className, children }: Props) {
  return (
    <Component
      className={cn(
        'rounded-card',
        variant === 'raised' ? 'border border-line bg-surface shadow-lifted' : 'bg-well',
        className,
      )}
    >
      {children}
    </Component>
  );
}
