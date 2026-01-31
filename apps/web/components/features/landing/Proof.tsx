import Image from "next/image";
import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
};

const Proof = ({ copy }: Props) => (
  <section className="flex flex-col gap-4" id="proof">
    <div className="grid gap-2">
      <h2 className="m-0 font-headline text-[1.6rem] leading-[1.25] text-slate-900">
        {copy.proofTitle}
      </h2>
    </div>
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
      <div className="grid gap-2.5">
        {copy.proofStats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[14px] border border-[var(--ns-border)] bg-white p-[14px]"
          >
            <div className="text-[1.4rem] font-bold text-slate-900">{stat.value}</div>
            <div className="mt-1 text-[var(--ns-muted)]">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="rounded-[16px] border border-dashed border-[var(--ns-border)] bg-white p-[18px] text-[0.95rem] leading-[1.6] text-[var(--ns-muted)]">
        <Image
          src={copy.proofImage}
          alt={copy.proofImageAlt}
          width={1200}
          height={720}
          className="block h-auto w-full rounded-[14px] shadow-[0_12px_28px_rgba(15,23,42,0.1)]"
        />
      </div>
    </div>
  </section>
);

export default Proof;
