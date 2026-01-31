"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMarketingLanguage } from "../../components/marketing/MarketingShell";
import { Button } from "../../components/ui/button";
import homeCopy from "../../data/marketing-home";

const HomePage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => homeCopy[lang], [lang]);
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
            <Button asChild size="pill" className="shadow-[0_14px_28px_rgba(15,118,110,0.22)]">
              <Link href="/login">{t.primaryCta}</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="pill"
              className="border-[rgba(15,23,42,0.12)] bg-white text-slate-900 shadow-[0_12px_24px_rgba(15,23,42,0.12)]"
            >
              <Link href="/pricing">{t.secondaryCta}</Link>
            </Button>
          </div>
          <div className="mt-5 grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
            {t.heroHighlights.map((item) => (
              <div
                key={item.label}
                className="rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-[#f5f8f7] p-[14px]"
              >
                <div className="text-[1.1rem] font-semibold">{item.value}</div>
                <div className="text-[0.9rem] text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_18px_36px_rgba(15,23,42,0.1)]">
          <Image
            src={t.heroImage}
            alt={t.heroImageAlt}
            width={520}
            height={420}
            className="block h-auto w-full rounded-[16px]"
            priority
          />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.highlightsTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.highlightsLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.highlights.map((item) => (
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

      <section className="flex flex-col gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.workflowTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.workflowLead}
          </p>
        </header>
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
      </section>

      <section className="flex flex-col gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.proofTitle}
          </h2>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.proofStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
            >
              <div className="text-[1.1rem] font-semibold">{stat.value}</div>
              <div className="text-[0.9rem] text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6" id="integrations">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.integrationsTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.integrationsLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.integrations.map((integration) => (
            <article
              key={integration.name}
              className="rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white p-[18px] shadow-[0_14px_28px_rgba(15,23,42,0.08)]"
            >
              <h3 className="m-0 mb-2 text-[1.05rem] font-semibold font-headline leading-[1.25]">
                {integration.name}
              </h3>
              <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {integration.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6" id="pricing">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.pricingTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.pricingLead}
          </p>
        </header>
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {t.pricingCards.map((plan) => (
            <article
              key={plan.name}
              className="grid gap-3 rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-white p-[22px] shadow-[0_20px_40px_rgba(15,23,42,0.1)]"
            >
              <div className="text-[1.1rem] font-semibold">{plan.name}</div>
              <div className="text-[2rem] font-semibold">{plan.price}</div>
              <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {plan.desc}
              </p>
              <ul className="m-0 grid list-disc gap-2 pl-4 text-[var(--ns-muted)] leading-[1.6] rtl:pl-0 rtl:pr-4 rtl:leading-[1.85]">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button asChild size="pill" className="shadow-[0_14px_28px_rgba(15,118,110,0.22)]">
                <Link href="/pricing">{plan.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="grid items-center gap-3 rounded-[26px] bg-slate-900 p-7 text-slate-50 shadow-[0_24px_48px_rgba(15,23,42,0.25)] [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <div>
          <h2 className="m-0 text-[1.5rem] font-semibold font-headline leading-[1.25]">
            {t.finalTitle}
          </h2>
          <p className="m-0 mt-1 text-slate-200 leading-[1.6] rtl:leading-[1.85]">{t.finalCopy}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="pill" className="shadow-[0_14px_28px_rgba(15,118,110,0.22)]">
            <Link href="/login">{t.finalPrimary}</Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="pill"
            className="border-white/40 bg-transparent text-slate-50 hover:bg-white/10"
          >
            <Link href="/pricing">{t.finalSecondary}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
