import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
};

const FAQ = ({ copy }: Props) => (
  <section className="flex flex-col gap-4" id="faq">
    <div className="grid gap-2">
      <h2 className="m-0 font-headline text-[1.6rem] leading-[1.25] text-slate-900">
        {copy.faqTitle}
      </h2>
    </div>
    <div className="grid gap-3">
      {copy.faq.map((item) => (
        <article
          key={item.q}
          className="rounded-[12px] border border-[var(--ns-border)] bg-white p-[14px]"
        >
          <h3 className="m-0 mb-1.5 font-bold">{item.q}</h3>
          <p className="m-0 text-[var(--ns-muted)] leading-[1.6]">{item.a}</p>
        </article>
      ))}
    </div>
  </section>
);

export default FAQ;
