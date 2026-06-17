"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMarketingLanguage } from "../../../components/marketing/MarketingShell";
import pricingCopy from "../../../data/marketing-pricing";

const PricingPage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => pricingCopy[lang], [lang]);
  const isAr = lang === "ar";

  return (
    <main
      className="px-[clamp(18px,5vw,56px)] py-[clamp(56px,8vw,100px)] text-left rtl:text-right"
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
    >
      <section className="grid max-w-[1180px] gap-12">
        <header className="grid max-w-[800px] gap-5">
          <p className="m-0 w-fit rounded-full border border-[rgba(15,118,110,0.24)] bg-white/75 px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#094b47]">
            {t.heroEyebrow}
          </p>
          <h1 className="m-0 text-[clamp(2.8rem,6vw,5.6rem)] font-extrabold leading-none">
            {t.heroTitle}
          </h1>
          <p className="m-0 max-w-[680px] text-[1.1rem] leading-[1.65] text-[#3f4d48] rtl:leading-[1.9]">
            {t.heroLead}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ns-accent)] px-5 font-extrabold text-white shadow-[0_16px_34px_rgba(15,118,110,0.22)]"
            >
              {t.primaryCta}
            </Link>
            <Link
              href="/#workflow"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(16,24,23,0.14)] bg-white/80 px-5 font-extrabold text-[#101817]"
            >
              {t.secondaryCta}
            </Link>
          </div>
        </header>

        <section className="grid gap-5">
          <div className="max-w-[760px]">
            <h2 className="m-0 text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-none">
              {t.plansTitle}
            </h2>
            <p className="m-0 mt-3 text-[1.08rem] leading-[1.65] text-[#4b5c56]">{t.plansLead}</p>
          </div>
          <div className="grid grid-cols-2 gap-3.5 max-[900px]:grid-cols-1">
            {t.plans.map((plan) => (
              <article
                key={plan.name}
                className="grid gap-4 rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-[clamp(26px,5vw,44px)] shadow-[0_16px_50px_rgba(16,24,23,0.08)]"
              >
                {plan.badge ? (
                  <span className="w-fit rounded-full bg-[#c7f36b] px-3 py-2 font-black">
                    {plan.badge}
                  </span>
                ) : null}
                <h3 className="m-0 text-3xl font-extrabold">{plan.name}</h3>
                <strong className="text-[clamp(3rem,8vw,7rem)] leading-[0.9]">{plan.price}</strong>
                <p className="m-0 leading-[1.65] text-[#4b5c56] rtl:leading-[1.9]">{plan.desc}</p>
                <ul className="m-0 grid list-disc gap-2 ps-5 text-[#4b5c56]">
                  {plan.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                {plan.disabled ? (
                  <button
                    type="button"
                    disabled
                    className="min-h-12 w-fit rounded-full border border-[rgba(16,24,23,0.12)] bg-[rgba(16,24,23,0.08)] px-5 font-extrabold text-[#56615e]"
                  >
                    {plan.cta}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-[var(--ns-accent)] px-5 font-extrabold text-white"
                  >
                    {plan.cta}
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          <div className="max-w-[760px]">
            <h2 className="m-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none">
              {t.comparisonTitle}
            </h2>
            <p className="m-0 mt-3 leading-[1.65] text-[#4b5c56] rtl:leading-[1.9]">
              {t.comparisonLead}
            </p>
          </div>
          <div className="overflow-hidden rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/80 shadow-[0_16px_50px_rgba(16,24,23,0.08)]">
            <div className="grid grid-cols-[1.4fr_0.8fr_0.8fr] border-b border-[rgba(16,24,23,0.1)] bg-white/80 px-5 py-4 text-[0.82rem] font-extrabold uppercase tracking-[0.06em] text-[#5f6b66]">
              <span>{isAr ? "الميزة" : "Feature"}</span>
              <span>{isAr ? "مجاني" : "Free"}</span>
              <span>Pro</span>
            </div>
            {t.comparison.map((row) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.4fr_0.8fr_0.8fr] gap-3 border-b border-[rgba(16,24,23,0.08)] px-5 py-4 last:border-b-0 max-[640px]:grid-cols-1"
              >
                <strong>{row.feature}</strong>
                <span className="text-[#4b5c56]">{row.free}</span>
                <span className="text-[#4b5c56]">{row.pro}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-5">
          <h2 className="m-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none">
            {t.faqTitle}
          </h2>
          <div className="grid gap-3">
            {t.faq.map((item) => (
              <details
                key={item.q}
                className="rounded-2xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-5"
              >
                <summary className="cursor-pointer text-[1rem] font-bold">{item.q}</summary>
                <p className="m-0 pt-3 leading-7 text-[#4b5c56]">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-3xl border border-[rgba(16,24,23,0.12)] bg-[#101817] p-7 text-white shadow-[0_16px_50px_rgba(16,24,23,0.08)] max-[760px]:grid-cols-1">
          <div>
            <h2 className="m-0 text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight">
              {t.finalTitle}
            </h2>
            <p className="m-0 mt-2 max-w-[650px] leading-[1.65] text-white/75 rtl:leading-[1.9]">
              {t.finalCopy}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ns-accent)] px-5 font-extrabold text-white"
            >
              {t.finalPrimary}
            </Link>
            <Link
              href="mailto:me@ahmedyassin.dev"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-5 font-extrabold"
            >
              {t.finalSecondary}
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
};

export default PricingPage;
