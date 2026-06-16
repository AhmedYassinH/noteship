"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, Database, RefreshCw } from "lucide-react";
import { useMarketingLanguage } from "../../components/marketing/MarketingShell";
import { Button } from "../../components/ui/Button";
import homeCopy from "../../data/marketing-home";

const HomePage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => homeCopy[lang], [lang]);
  const isAr = lang === "ar";

  const trustIcons = [ShieldCheck, Database, RefreshCw];

  return (
    <main
      className="flex flex-col gap-20 text-left rtl:text-right"
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
    >
      <section className="grid items-center gap-8 border-b border-[rgba(15,23,42,0.12)] pb-12 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
        <div className="grid gap-4">
          <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[var(--ns-muted)]">
            {t.heroKicker}
          </p>
          <h1 className="m-0 max-w-[16ch] font-headline text-[clamp(2.25rem,4.8vw,3.35rem)] leading-[1.14]">
            {t.heroTitle}
          </h1>
          <p className="m-0 max-w-[55ch] text-[1.02rem] leading-[1.72] text-[var(--ns-muted)] rtl:leading-[1.9]">
            {t.heroSub}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button type="button" size="pill" asChild>
              <Link href="/login">{t.heroPrimary}</Link>
            </Button>
            <Button type="button" size="pill" variant="outline" asChild>
              <Link href="#how-it-works">{t.heroSecondary}</Link>
            </Button>
            <Link
              href="#security"
              className="inline-flex items-center px-1 text-[0.95rem] text-[var(--ns-muted)] underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
            >
              {t.heroTertiary}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2.5 text-[0.86rem] text-[var(--ns-muted)]">
            {t.heroProof.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(15,23,42,0.12)] px-3 py-1"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.1)]">
          <Image
            src={t.heroImage}
            alt={t.heroImageAlt}
            width={540}
            height={410}
            className="block h-auto w-full rounded-xl"
            priority
          />
        </div>
      </section>
      <section className="grid gap-6 [grid-template-columns:1.2fr_0.8fr] max-[920px]:grid-cols-1">
        <div className="grid gap-4">
          <h2 className="m-0 max-w-[19ch] font-headline text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.2]">
            {t.problemTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.72] text-[var(--ns-muted)] rtl:leading-[1.9]">
            {t.problemLead}
          </p>
          <ul className="m-0 grid list-disc gap-2 pl-5 text-[var(--ns-muted)] leading-[1.68] rtl:pl-0 rtl:pr-5 rtl:leading-[1.9]">
            {t.problemPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
        <aside className="self-start border-s-2 border-[rgba(15,118,110,0.35)] bg-white/70 px-5 py-4 text-[1.02rem] text-slate-800 leading-[1.72] rtl:border-s-0 rtl:border-e-2 rtl:leading-[1.9]">
          {t.problemQuote}
        </aside>
      </section>
      <section id="how-it-works" className="grid gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.2]">
            {t.workflowTitle}
          </h2>
          <p className="m-0 max-w-[62ch] text-[1rem] leading-[1.72] text-[var(--ns-muted)] rtl:leading-[1.9]">
            {t.workflowLead}
          </p>
        </header>

        <div className="grid gap-3.5 border-y border-[rgba(15,23,42,0.12)] py-6">
          {t.workflowSteps.map((step, index) => (
            <article
              key={step.title}
              className="grid grid-cols-[auto_1fr] gap-3 rounded-xl bg-white px-4 py-3.5"
            >
              <div className="grid h-8 w-8 place-items-center rounded-full border border-[rgba(15,118,110,0.26)] text-[0.88rem] font-semibold text-[var(--ns-accent-strong)]">
                {index + 1}
              </div>
              <div>
                <h3 className="m-0 font-headline text-[1.1rem] leading-[1.25]">{step.title}</h3>
                <p className="m-0 mt-1 text-[0.96rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
                  {step.copy}
                </p>
              </div>
            </article>
          ))}
        </div>
        <p className="m-0 text-[0.92rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
          {t.workflowNote}
        </p>
      </section>
      <section className="grid gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.2]">
            {t.pillarsTitle}
          </h2>
          <p className="m-0 text-[1rem] text-[var(--ns-muted)] leading-[1.72] rtl:leading-[1.9]">
            {t.pillarsLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="grid gap-2 rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
            >
              <h3 className="m-0 font-headline text-[1.15rem] leading-[1.25]">{pillar.title}</h3>
              <p className="m-0 text-[0.95rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
                {pillar.copy}
              </p>
              <ul className="m-0 mt-1 grid list-disc gap-1.5 pl-4 text-[0.92rem] text-[var(--ns-muted)] rtl:pl-0 rtl:pr-4">
                {pillar.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <section id="security" className="grid gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.2]">
            {t.trustTitle}
          </h2>
          <p className="m-0 text-[1rem] text-[var(--ns-muted)] leading-[1.72] rtl:leading-[1.9]">
            {t.trustLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.trustItems.map((item, index) => {
            const Icon = trustIcons[index % trustIcons.length];
            return (
              <article
                key={item.title}
                className="grid gap-2 border border-[rgba(15,23,42,0.1)] bg-white px-5 py-4"
              >
                <Icon className="h-4.5 w-4.5 text-[var(--ns-accent-strong)]" aria-hidden="true" />
                <h3 className="m-0 text-[1rem] font-semibold">{item.title}</h3>
                <p className="m-0 text-[0.94rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
                  {item.copy}
                </p>
              </article>
            );
          })}
        </div>
      </section>
      <section className="grid gap-6" id="pricing">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.2]">
            {t.pricingTitle}
          </h2>
          <p className="m-0 text-[1rem] text-[var(--ns-muted)] leading-[1.72] rtl:leading-[1.9]">
            {t.pricingLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {t.pricingCards.map((plan) => (
            <article
              key={plan.name}
              className="grid gap-3 rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
            >
              <div className="text-[1.05rem] font-semibold">{plan.name}</div>
              <div className="text-[1.9rem] font-semibold">{plan.price}</div>
              <p className="m-0 text-[0.95rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
                {plan.desc}
              </p>
              <ul className="m-0 grid list-disc gap-1.5 pl-4 text-[0.92rem] text-[var(--ns-muted)] rtl:pl-0 rtl:pr-4">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button type="button" size="pill" asChild>
                <Link href="/login">{plan.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
        <Link
          href="/pricing"
          className="w-fit text-[0.95rem] text-[var(--ns-muted)] underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
        >
          {isAr ? "اعرض مقارنة الخطط" : "Compare plans in detail"}
        </Link>
      </section>
      <section id="faq" className="grid gap-4 border-y border-[rgba(15,23,42,0.12)] py-6">
        <h2 className="m-0 font-headline text-[clamp(1.7rem,3vw,2.3rem)] leading-[1.2]">
          {t.faqTitle}
        </h2>
        {t.faq.map((item) => (
          <details key={item.q} className="group border-b border-[rgba(15,23,42,0.1)] py-3">
            <summary className="cursor-pointer list-none pe-6 text-[1rem] font-semibold">
              {item.q}
            </summary>
            <p className="m-0 pt-2 text-[0.95rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
              {item.a}
            </p>
          </details>
        ))}
      </section>
      <section className="grid items-center gap-4 border border-[rgba(15,23,42,0.12)] bg-white px-6 py-7 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <div>
          <h2 className="m-0 font-headline text-[1.55rem] leading-[1.22]">{t.finalTitle}</h2>
          <p className="m-0 mt-2 text-[0.96rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
            {t.finalCopy}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3 rtl:justify-start">
          <Button type="button" size="pill" asChild>
            <Link href="/login">{t.finalPrimary}</Link>
          </Button>
          <Button type="button" size="pill" variant="ghost" asChild>
            <Link href="mailto:me@ahmedyassin.dev">{t.finalSecondary}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
