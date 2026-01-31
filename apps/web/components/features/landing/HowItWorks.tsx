import Image from "next/image";
import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
};

const HowItWorks = ({ copy }: Props) => (
  <section className="flex flex-col gap-4" id="how">
    <div className="grid gap-2">
      <h2 className="m-0 font-headline text-[1.6rem] leading-[1.25] text-slate-900">
        {copy.howTitle}
      </h2>
    </div>
    <div className="grid gap-3">
      {copy.howSteps.map((step, idx) => (
        <div
          key={step.title}
          className="grid grid-cols-[auto_1fr] items-start gap-2 rounded-[14px] border border-[var(--ns-border)] bg-white p-[14px] shadow-[0_10px_18px_rgba(15,23,42,0.06)]"
        >
          <span className="min-w-[32px] font-bold text-[var(--ns-accent-strong)]">
            {String(idx + 1).padStart(2, "0")}
          </span>
          <div>
            <div className="font-bold">{step.title}</div>
            <p className="m-0 text-[var(--ns-muted)] leading-[1.6]">{step.copy}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="rounded-[16px] border border-dashed border-[var(--ns-border)] bg-white p-[18px] text-[0.95rem] leading-[1.6] text-[var(--ns-muted)]">
      <Image
        src={copy.heroImage}
        alt={copy.heroImageAlt}
        width={1200}
        height={720}
        className="block h-auto w-full rounded-[14px] shadow-[0_12px_28px_rgba(15,23,42,0.1)]"
      />
    </div>
  </section>
);

export default HowItWorks;
