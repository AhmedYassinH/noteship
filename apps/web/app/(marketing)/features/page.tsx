"use client";

import { useMemo } from "react";
import {
  useMarketingLanguage,
  useWaitlistModal,
} from "../../../components/marketing/MarketingShell";
import { Button } from "../../../components/ui/Button";
import featuresCopy from "../../../data/marketing-features";

const FeaturesPage = () => {
  const { lang } = useMarketingLanguage();
  const { openWaitlist } = useWaitlistModal();
  const t = useMemo(() => featuresCopy[lang], [lang]);
  const isAr = lang === "ar";

  return (
    <main
      className="flex flex-col gap-16 text-left rtl:text-right"
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
    >
      <section className="grid items-center gap-8 rounded-[28px] border border-[rgba(15,23,42,0.08)] bg-white/90 p-9 shadow-[0_30px_60px_rgba(15,23,42,0.12)] [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))] max-[720px]:p-7">
        <div>
          <p className="m-0 mb-2 text-[0.72rem] uppercase tracking-[0.3em] text-[var(--ns-muted)]">
            {t.heroKicker}
          </p>
          <h1 className="m-0 mb-3 font-headline text-[clamp(2.4rem,4vw,3.4rem)] font-semibold leading-[1.15]">
            {t.heroTitle}
          </h1>
          <p className="m-0 mb-4 text-[1.05rem] leading-[1.75] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.heroSub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              type="button"
              size="pill"
              onClick={openWaitlist}
              className="shadow-[0_14px_28px_rgba(15,118,110,0.22)]"
            >
              {t.primaryCta}
            </Button>
          </div>
        </div>
        <div className="rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white/95 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
          <h3 className="m-0 mb-3 text-[0.95rem] font-semibold font-headline leading-[1.25]">
            {t.workflowTitle}
          </h3>
          <div className="grid gap-3.5">
            {t.workflowSteps.map((step, index) => (
              <div
                key={step.title}
                className="grid grid-cols-[auto_1fr] gap-3 rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-4 shadow-[0_12px_24px_rgba(15,23,42,0.08)]"
              >
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-[rgba(15,118,110,0.12)] font-semibold text-[var(--ns-accent-strong)]">
                  {index + 1}
                </div>
                <div>
                  <strong className="block font-semibold font-headline leading-[1.25]">
                    {step.title}
                  </strong>
                  <p className="m-0 mt-1 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                    {step.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6" id="about">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.pillarsTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.pillarsLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
            >
              <h3 className="m-0 mb-2 text-[1.05rem] font-semibold font-headline leading-[1.25]">
                {pillar.title}
              </h3>
              <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {pillar.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6" id="docs">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.deepDiveTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.deepDiveLead}
          </p>
        </header>
        <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {t.deepDive.map((item) => (
            <article
              key={item.title}
              className="rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white/95 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.08)]"
            >
              <h3 className="m-0 mb-2 text-[1.05rem] font-semibold font-headline leading-[1.25]">
                {item.title}
              </h3>
              <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {item.copy}
              </p>
              <ul className="m-0 mt-3 grid list-disc gap-2 pl-4 text-[var(--ns-muted)] leading-[1.6] rtl:pl-0 rtl:pr-4 rtl:leading-[1.85]">
                {item.items.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6" id="reliability">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.reliabilityTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.reliabilityLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.reliabilityItems.map((item) => (
            <article
              key={item.title}
              className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
            >
              <h3 className="m-0 mb-2 text-[1.05rem] font-semibold font-headline leading-[1.25]">
                {item.title}
              </h3>
              <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6" id="integrations">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.aboutTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.aboutCopy}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          <article
            className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
            id="changelog"
          >
            <h3 className="m-0 mb-2 text-[1.05rem] font-semibold font-headline leading-[1.25]">
              LinkedIn
            </h3>
            <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
              {isAr
                ? "انشر وجدّل مع تحديثات حالة واضحة."
                : "Publish and schedule with clear status updates."}
            </p>
          </article>
          <article className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
            <h3 className="m-0 mb-2 text-[1.05rem] font-semibold font-headline leading-[1.25]">
              Medium
            </h3>
            <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
              {isAr
                ? "صياغة طويلة المدى من دون تبديل الأدوات."
                : "Long-form publishing without switching tools."}
            </p>
          </article>
          <article className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_14px_28px_rgba(15,23,42,0.08)]">
            <h3 className="m-0 mb-2 text-[1.05rem] font-semibold font-headline leading-[1.25]">
              {isAr ? "المزيد قريباً" : "More soon"}
            </h3>
            <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
              {isAr ? "بوابات نشر إضافية حسب الحاجة." : "More publishing endpoints as you scale."}
            </p>
          </article>
        </div>
      </section>

      <section className="grid items-center gap-3 rounded-[26px] bg-slate-900 p-7 text-slate-50 shadow-[0_24px_48px_rgba(15,23,42,0.25)] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <div>
          <h2 className="m-0 text-[1.5rem] font-semibold font-headline leading-[1.25]">
            {t.ctaTitle}
          </h2>
          <p className="m-0 mt-1 text-slate-200 leading-[1.6] rtl:leading-[1.85]">{t.ctaCopy}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            size="pill"
            onClick={openWaitlist}
            className="shadow-[0_14px_28px_rgba(15,118,110,0.22)]"
          >
            {t.ctaPrimary}
          </Button>
        </div>
      </section>
    </main>
  );
};

export default FeaturesPage;
