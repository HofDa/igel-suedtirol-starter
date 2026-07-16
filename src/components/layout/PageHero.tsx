type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function PageHero({eyebrow, title, description, children}: Props) {
  return (
    <section className="border-b border-emerald-950/10 bg-gradient-to-br from-sand-light to-cream py-14 md:py-20">
      <div className="container-page">
        {eyebrow && <p className="mb-3 font-bold uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p>}
        <h1 className="max-w-4xl text-4xl font-black leading-tight text-emerald-950 md:text-6xl">{title}</h1>
        <p className="mt-5 max-w-3xl text-lg text-emerald-950/75 md:text-xl">{description}</p>
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}
