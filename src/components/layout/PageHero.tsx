import type { ReactNode } from 'react';
import { BotanicalBackdrop } from './BotanicalBackdrop';

type Props = {
  title: string;
  description: string;
  children?: ReactNode;
  compact?: boolean;
};

/**
 * Ruhiger, offener Seitenanfang mit organischen Formen aus der Logopalette.
 * Die Überschrift steht im abgedunkelten Blattgrün des Projektlogos. Die
 * Dachmarke färbt ihre erste Überschrift genauso grün; der Ton ist hier nur
 * der eigene.
 */
export function PageHero({ title, description, children, compact = false }: Props) {
  return (
    <section className="relative isolate overflow-hidden border-b border-line bg-band">
      <BotanicalBackdrop
        className="absolute inset-y-0 right-0 -z-10 h-full w-[min(62rem,90vw)]"
        compact
      />
      <div
        className={
          compact
            ? 'container-page relative py-9 md:py-12'
            : 'container-page relative py-14 md:py-20'
        }
      >
        <span
          aria-hidden="true"
          className={
            compact
              ? 'mb-4 block h-1 w-14 rounded-full bg-primary'
              : 'mb-6 block h-1 w-14 rounded-full bg-primary'
          }
        />
        <h1
          className={
            compact
              ? 'max-w-3xl text-section font-semibold text-balance text-primary-deep md:text-display'
              : 'max-w-3xl text-display font-semibold text-balance text-primary-deep md:text-display-lg'
          }
        >
          {title}
        </h1>
        <p
          className={
            compact
              ? 'mt-3 max-w-[58ch] text-body text-ink-dim'
              : 'mt-5 max-w-[58ch] text-lead text-ink-dim'
          }
        >
          {description}
        </p>
        {children && <div className="mt-7 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
