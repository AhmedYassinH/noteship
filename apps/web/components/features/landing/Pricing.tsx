import { Button } from "../../ui/button";
import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
};

const Pricing = ({ copy }: Props) => (
  <section className="flex flex-col gap-4" id="pricing">
    <div className="grid gap-2">
      <h2 className="m-0 font-headline text-[1.6rem] leading-[1.25] text-slate-900">
        {copy.pricingTitle}
      </h2>
      <p className="m-0 text-[1rem] leading-[1.65] text-[var(--ns-muted)]">{copy.pricingSub}</p>
    </div>
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
      {copy.plans.map((plan) => (
        <article
          key={plan.name}
          className="grid gap-2.5 rounded-[16px] border border-[var(--ns-border)] bg-white p-[18px] shadow-[0_12px_22px_rgba(15,23,42,0.08)]"
        >
          <div className="flex items-center justify-between">
            <div className="text-[1rem] font-bold">{plan.name}</div>
            <div className="font-bold">{plan.price}</div>
          </div>
          <ul className="m-0 grid list-none gap-2 p-0 text-[var(--ns-muted)]">
            {plan.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <Button variant="default" size="pill">
            {plan.cta}
          </Button>
        </article>
      ))}
    </div>
  </section>
);

export default Pricing;
