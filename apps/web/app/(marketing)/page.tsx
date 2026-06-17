"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMarketingLanguage } from "../../components/marketing/MarketingShell";
import homeCopy from "../../data/marketing-home";

const HomePage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => homeCopy[lang], [lang]);
  const isAr = lang === "ar";

  return (
    <main className="text-left rtl:text-right" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <section className="grid min-h-[calc(100vh-74px)] grid-cols-[minmax(0,0.88fr)_minmax(380px,1.12fr)] items-center gap-[clamp(30px,5vw,76px)] px-[clamp(18px,5vw,56px)] pb-9 pt-[clamp(42px,6vw,78px)] max-[980px]:grid-cols-1">
        <div className="grid max-w-[680px] gap-5">
          <p className="m-0 w-fit rounded-full border border-[rgba(15,118,110,0.24)] bg-white/75 px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#094b47]">
            {t.heroEyebrow}
          </p>
          <h1 className="m-0 max-w-[690px] text-[clamp(3.25rem,6.6vw,6.6rem)] font-extrabold leading-[0.94] tracking-normal max-[620px]:text-[clamp(2.75rem,11.4vw,3.55rem)] max-[620px]:leading-[1.02]">
            {t.heroTitle}
          </h1>
          <p className="m-0 max-w-[590px] text-[clamp(1rem,1.55vw,1.18rem)] leading-[1.55] text-[#3f4d48] rtl:leading-[1.85]">
            {t.heroLead}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ns-accent)] px-5 font-extrabold text-white shadow-[0_16px_34px_rgba(15,118,110,0.22)]"
            >
              {t.heroPrimary}
            </Link>
            <Link
              href="#workflow"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(16,24,23,0.14)] bg-white/80 px-5 font-extrabold text-[#101817]"
            >
              {t.heroSecondary}
            </Link>
          </div>
          <div className="flex flex-wrap gap-3 text-[0.9rem] text-[#31423d]">
            {t.proof.map((item) => (
              <span
                key={item}
                className="rounded-full border border-[rgba(16,24,23,0.1)] bg-white/65 px-3 py-2"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="relative min-h-[570px] min-w-0 max-[980px]:min-h-0">
          <div className="relative max-w-full overflow-hidden rounded-[28px] border border-[rgba(16,24,23,0.12)] bg-white/80 shadow-[0_26px_80px_rgba(16,24,23,0.14)] rotate-[1.4deg] rtl:-rotate-[1.4deg] max-[620px]:w-full max-[620px]:rotate-0">
            <div className="flex items-center gap-2 border-b border-[rgba(16,24,23,0.1)] p-4">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffb3a7]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#c7f36b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#99e9ff]" />
              <strong className="ms-auto">Noteship</strong>
            </div>
            <div className="grid min-h-[470px] grid-cols-[76px_1fr_180px] max-[980px]:grid-cols-[64px_1fr] max-[620px]:grid-cols-1">
              <aside className="grid content-start gap-3 border-e border-[rgba(16,24,23,0.08)] p-5 max-[620px]:hidden">
                <span className="h-11 rounded-2xl bg-[#101817]" />
                <span className="h-11 rounded-2xl bg-[rgba(16,24,23,0.08)]" />
                <span className="h-11 rounded-2xl bg-[rgba(16,24,23,0.08)]" />
                <span className="h-11 rounded-2xl bg-[rgba(16,24,23,0.08)]" />
              </aside>
              <section className="grid content-start gap-5 p-5">
                <div className="h-[18px] w-[90%] rounded-full bg-[rgba(16,24,23,0.1)]" />
                <div className="h-[18px] rounded-full bg-[rgba(16,24,23,0.1)]" />
                <div className="h-[18px] w-1/2 rounded-full bg-[rgba(16,24,23,0.1)]" />
                <div className="rounded-[20px] border border-[rgba(16,24,23,0.1)] bg-[#101817] p-[18px] text-white">
                  <span className="mb-2 block text-[0.78rem] font-extrabold uppercase text-[#b8eee8]">
                    {t.visual.recallLabel}
                  </span>
                  <strong>{t.visual.recallTitle}</strong>
                </div>
                <div className="rounded-[20px] border border-[rgba(16,24,23,0.1)] bg-white/85 p-[18px]">
                  <span className="mb-2 block text-[0.78rem] font-extrabold uppercase text-[#5f6b66]">
                    {t.visual.draftLabel}
                  </span>
                  <p className="m-0 text-[1.02rem] leading-[1.45] text-[#31423d]">
                    {t.visual.draftCopy}
                  </p>
                </div>
              </section>
              <aside className="grid content-start gap-3 border-s border-[rgba(16,24,23,0.08)] bg-[#f7f8f4]/70 p-5 max-[980px]:col-span-full max-[980px]:grid-cols-3 max-[980px]:border-s-0 max-[980px]:border-t max-[620px]:grid-cols-1">
                <div className="rounded-[20px] border border-[rgba(16,24,23,0.1)] bg-white/85 p-[18px]">
                  <span className="mb-2 block text-[0.78rem] font-extrabold uppercase text-[#5f6b66]">
                    {t.visual.metricDrafts}
                  </span>
                  <strong className="block text-[clamp(1.55rem,2.6vw,2.05rem)] leading-none">
                    {t.visual.metricDraftsValue}
                  </strong>
                </div>
                <div className="rounded-[20px] border border-[rgba(16,24,23,0.1)] bg-white/85 p-[18px]">
                  <span className="mb-2 block text-[0.78rem] font-extrabold uppercase text-[#5f6b66]">
                    {t.visual.metricRecall}
                  </span>
                  <strong className="block text-[clamp(1.55rem,2.6vw,2.05rem)] leading-none">
                    {t.visual.metricRecallValue}
                  </strong>
                </div>
                <button
                  type="button"
                  className="min-h-[46px] rounded-full border-0 bg-[var(--ns-accent)] px-4 font-extrabold text-white"
                >
                  {t.visual.publish}
                </button>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3.5 px-[clamp(18px,5vw,56px)] py-3 max-[980px]:grid-cols-1">
        {t.strip.map((item) => (
          <article
            key={item.value}
            className="grid min-h-[120px] gap-1 rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-6 shadow-[0_16px_50px_rgba(16,24,23,0.08)]"
          >
            <strong className="text-[clamp(2rem,4vw,3.45rem)] leading-none">{item.value}</strong>
            <span className="text-[#5f6b66]">{item.label}</span>
          </article>
        ))}
      </section>

      <section id="workflow" className="px-[clamp(18px,5vw,56px)] py-[clamp(56px,8vw,110px)]">
        <div className="max-w-[760px]">
          <p className="mb-5 w-fit rounded-full border border-[rgba(15,118,110,0.24)] bg-white/75 px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#094b47]">
            {t.workflowEyebrow}
          </p>
          <h2 className="m-0 text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-none">
            {t.workflowTitle}
          </h2>
          <p className="mt-4 text-[1.12rem] leading-[1.6] text-[#3f4d48]">{t.workflowLead}</p>
        </div>
        <div className="mt-9 grid grid-cols-5 gap-3.5 max-[980px]:grid-cols-1">
          {t.workflowSteps.map((step) => (
            <article
              key={step.number}
              className="min-h-[250px] rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-6 shadow-[0_16px_50px_rgba(16,24,23,0.08)] max-[980px]:min-h-[180px]"
            >
              <span className="mb-10 inline-flex font-black text-[var(--ns-accent)]">
                {step.number}
              </span>
              <h3 className="m-0 text-[1.5rem] font-extrabold">{step.title}</h3>
              <p className="mt-2 text-[#4b5c56] leading-[1.55]">{step.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="launch-plan"
        className="grid grid-cols-[0.9fr_1.1fr] items-center gap-7 bg-[#101817] px-[clamp(18px,5vw,56px)] py-[clamp(56px,8vw,110px)] text-white max-[980px]:grid-cols-1"
      >
        <div>
          <p className="mb-5 w-fit rounded-full border border-white/15 bg-white/10 px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#b8eee8]">
            {t.launchEyebrow}
          </p>
          <h2 className="m-0 text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-none">
            {t.launchTitle}
          </h2>
          <p className="mt-4 text-[1.12rem] leading-[1.6] text-white/75">{t.launchLead}</p>
        </div>
        <div className="grid grid-cols-2 gap-3.5 max-[620px]:grid-cols-1">
          {t.launchItems.map((item) => (
            <div
              key={item.value}
              className="min-h-[190px] rounded-[26px] border border-white/15 bg-white/[0.07] p-7"
            >
              <strong className="block text-[clamp(2rem,4vw,3.5rem)] leading-none text-[#c7f36b]">
                {item.value}
              </strong>
              <span className="mt-4 block text-white/75">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="trust" className="px-[clamp(18px,5vw,56px)] py-[clamp(56px,8vw,110px)]">
        <div className="max-w-[760px]">
          <p className="mb-5 w-fit rounded-full border border-[rgba(15,118,110,0.24)] bg-white/75 px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#094b47]">
            {t.trustEyebrow}
          </p>
          <h2 className="m-0 text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-none">
            {t.trustTitle}
          </h2>
        </div>
        <div className="mt-7 grid grid-cols-3 gap-3.5 max-[980px]:grid-cols-1">
          {t.trustItems.map((item) => (
            <article
              key={item.title}
              className="min-h-[220px] rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-6 shadow-[0_16px_50px_rgba(16,24,23,0.08)]"
            >
              <h3 className="m-0 text-[1.5rem] font-extrabold">{item.title}</h3>
              <p className="mt-2 leading-[1.55] text-[#4b5c56]">{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="pricing"
        className="grid grid-cols-2 gap-3.5 px-[clamp(18px,5vw,56px)] py-[clamp(56px,8vw,110px)] max-[980px]:grid-cols-1"
      >
        <article className="grid gap-4 rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-[clamp(26px,5vw,44px)] shadow-[0_16px_50px_rgba(16,24,23,0.08)]">
          <span className="w-fit rounded-full bg-[#c7f36b] px-3 py-2 font-black">
            {t.pricing.freeBadge}
          </span>
          <h2 className="m-0 text-3xl font-extrabold">{t.pricing.freeTitle}</h2>
          <p className="text-[#4b5c56]">{t.pricing.freeCopy}</p>
          <strong className="text-[clamp(3rem,8vw,7rem)] leading-[0.9]">
            {t.pricing.freePrice}
          </strong>
          <Link
            href="/login"
            className="inline-flex min-h-12 w-fit items-center justify-center rounded-full bg-[var(--ns-accent)] px-5 font-extrabold text-white shadow-[0_16px_34px_rgba(15,118,110,0.22)]"
          >
            {t.pricing.freeCta}
          </Link>
        </article>
        <article className="grid gap-4 rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/65 p-[clamp(26px,5vw,44px)] opacity-80 shadow-[0_16px_50px_rgba(16,24,23,0.08)]">
          <span className="w-fit rounded-full bg-[#c7f36b] px-3 py-2 font-black">
            {t.pricing.proBadge}
          </span>
          <h2 className="m-0 text-3xl font-extrabold">{t.pricing.proTitle}</h2>
          <p className="text-[#4b5c56]">{t.pricing.proCopy}</p>
          <strong className="text-[clamp(3rem,8vw,7rem)] leading-[0.9]">
            {t.pricing.proPrice}
          </strong>
          <button
            type="button"
            disabled
            className="min-h-12 w-fit rounded-full border border-[rgba(16,24,23,0.12)] bg-[rgba(16,24,23,0.08)] px-5 font-extrabold text-[#56615e]"
          >
            {t.pricing.proCta}
          </button>
        </article>
      </section>

      <section id="faq" className="px-[clamp(18px,5vw,56px)] py-[clamp(36px,6vw,70px)]">
        <h2 className="m-0 text-[clamp(2rem,4vw,3.5rem)] font-extrabold leading-none">
          {t.faqTitle}
        </h2>
        <div className="mt-6 grid gap-3">
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

      <section className="grid min-h-[70vh] place-items-center px-[clamp(18px,5vw,56px)] py-[clamp(56px,8vw,110px)] text-center">
        <div className="grid justify-items-center gap-5">
          <p className="m-0 w-fit rounded-full border border-[rgba(15,118,110,0.24)] bg-white/75 px-3 py-2 text-[0.78rem] font-extrabold uppercase tracking-[0.06em] text-[#094b47]">
            {t.finalEyebrow}
          </p>
          <h2 className="m-0 max-w-[980px] text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-none">
            {t.finalTitle}
          </h2>
          <Link
            href="/login"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ns-accent)] px-5 font-extrabold text-white shadow-[0_16px_34px_rgba(15,118,110,0.22)]"
          >
            {t.finalCta}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
