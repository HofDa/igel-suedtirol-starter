import {PageHero} from './PageHero';

type InfoItem = {title: string; text: string};

type Props = {
  eyebrow?: string;
  title: string;
  description: string;
  items: InfoItem[];
};

export function InfoPage({eyebrow, title, description, items}: Props) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} description={description} />
      <section className="container-page py-14">
        <div className="grid gap-5 md:grid-cols-2">
          {items.map((item) => (
            <article key={item.title} className="card p-7">
              <h2 className="text-xl font-black text-emerald-950">{item.title}</h2>
              <p className="mt-3 text-emerald-950/70">{item.text}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
