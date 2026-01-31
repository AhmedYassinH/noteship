import { Button } from "../../ui/button";
import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
};

const FinalCta = ({ copy }: Props) => (
  <section className="grid items-center gap-3 rounded-[var(--ns-radius)] bg-slate-900 p-7 text-slate-50 shadow-[var(--ns-shadow)] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
    <div>
      <h3 className="m-0 text-[1.4rem] font-bold">{copy.finalTitle}</h3>
      <p className="m-0 mt-1 text-slate-200 leading-[1.6]">{copy.finalCopy}</p>
    </div>
    <div className="flex flex-wrap gap-2.5">
      <Button variant="default" size="pill">
        {copy.primaryCta}
      </Button>
      <Button variant="secondary" size="pill">
        {copy.secondaryCta}
      </Button>
    </div>
  </section>
);

export default FinalCta;
