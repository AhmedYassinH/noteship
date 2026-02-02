import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
};

const Pillars = ({ copy }: Props) => (
  <section className="flex flex-col gap-4">
    <div className="grid gap-2">
      <h2 className="m-0 font-headline text-[1.6rem] leading-[1.25] text-slate-900">
        {copy.pillarsTitle}
      </h2>
    </div>
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
      {copy.pillars.map((pillar) => (
        <article
          key={pillar.title}
          className="rounded-[16px] border border-[var(--ns-border)] bg-white p-[18px] shadow-[0_12px_20px_rgba(15,23,42,0.06)]"
        >
          <h3 className="m-0 text-[1rem] font-bold text-slate-900">{pillar.title}</h3>
          <p className="m-0 mt-2 text-[var(--ns-muted)] leading-[1.6]">{pillar.copy}</p>
        </article>
      ))}
    </div>
  </section>
);

export default Pillars;
