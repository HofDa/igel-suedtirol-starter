import type { ReactNode } from 'react';
import { PageHero } from './PageHero';
import { Leaf } from 'lucide-react';

type InfoItem = { title: string; text: string };

type Props = {
  title: string;
  description: string;
  items: InfoItem[];
  /** Optionale Handlung im Seitenkopf, z. B. der Weg zur Karte. */
  heroAction?: ReactNode;
};

/**
 * Luftige Lesespalte mit kleinen organischen Markenakzenten.
 */
export function InfoPage({ title, description, items, heroAction }: Props) {
  return (
    <>
      <PageHero title={title} description={description}>
        {heroAction}
      </PageHero>
      {/* Die Lesespalte beginnt an derselben Kante wie der Seitenkopf – sonst
          hat dieselbe Seite zwei verschiedene linke Ränder. */}
      <div className="container-page pb-16 pt-12 md:pb-20 md:pt-16">
        <div className="max-w-4xl border-t border-line">
          {items.map((item) => (
            <section
              key={item.title}
              className="grid gap-3 border-b border-line py-8 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-10 md:py-10"
            >
              {/* Ein einziges, gleichbleibendes Blattzeichen. Die frühere
                  Abwechslung grün/pink lief über die Position in der Liste;
                  Pink kennzeichnet aber Beobachtungsdaten und ist kein
                  Schmuck (DESIGN.md). */}
              <h2 className="flex items-start gap-3 text-title font-semibold text-balance text-ink">
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-primary-wash text-primary-deep">
                  <Leaf size={17} aria-hidden="true" />
                </span>
                {item.title}
              </h2>
              <p className="max-w-[68ch] text-ink-dim">{item.text}</p>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
