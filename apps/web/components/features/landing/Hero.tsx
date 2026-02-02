import Image from "next/image";
import { Button } from "../../ui/Button";
import { LandingCopy } from "../../../data/landing";

type Props = {
  copy: LandingCopy;
  isAr: boolean;
};

const Hero = ({ copy, isAr }: Props) => {
  return (
    <header
      className="grid items-center gap-6 rounded-[var(--ns-radius)] border border-[var(--ns-border)] bg-white/90 p-10 shadow-[var(--ns-shadow)] md:grid-cols-[1.1fr_0.9fr]"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <p className="m-0 text-[0.7rem] uppercase tracking-[0.36em] text-[var(--ns-muted)]">
            {copy.heroKicker}
          </p>
        </div>
        <h1 className="m-0 font-headline text-[clamp(36px,5vw,50px)] leading-[1.15] text-slate-900">
          {copy.heroTitle}
        </h1>
        <p className="m-0 text-[1.05rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
          {copy.heroSub}
        </p>
        <div className="mt-1 inline-flex flex-wrap gap-3">
          <Button variant="default" size="pill">
            {copy.primaryCta}
          </Button>
          <Button variant="secondary" size="pill">
            {copy.secondaryCta}
          </Button>
        </div>
      </div>
      <div className="rounded-[18px] border border-dashed border-[var(--ns-border)] bg-white p-[18px] text-[0.95rem] leading-[1.6] text-[var(--ns-muted)]">
        <Image
          src={copy.heroImage}
          alt={copy.heroImageAlt}
          width={1200}
          height={720}
          className="block h-auto w-full rounded-[14px] shadow-[0_12px_28px_rgba(15,23,42,0.1)]"
          priority
        />
      </div>
    </header>
  );
};

export default Hero;
