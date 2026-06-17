"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMarketingLanguage } from "../../../components/marketing/MarketingShell";
import featuresCopy from "../../../data/marketing-features";

const FeaturesPage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => featuresCopy[lang], [lang]);
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
              href="/pricing"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(16,24,23,0.14)] bg-white/80 px-5 font-extrabold text-[#101817]"
            >
              {t.secondaryCta}
            </Link>
          </div>
        </header>

        <section className="grid grid-cols-3 gap-3.5 max-[980px]:grid-cols-1">
          {t.sections.map((section) => (
            <article
              key={section.title}
              className="grid min-h-[300px] content-start gap-4 rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-6 shadow-[0_16px_50px_rgba(16,24,23,0.08)]"
            >
              <h2 className="m-0 text-[1.7rem] font-extrabold leading-tight">{section.title}</h2>
              <p className="m-0 leading-[1.65] text-[#4b5c56] rtl:leading-[1.9]">{section.copy}</p>
              <ul className="m-0 grid list-disc gap-2 ps-5 text-[#4b5c56]">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-7 rounded-[28px] bg-[#101817] p-[clamp(24px,5vw,48px)] text-white">
          <h2 className="m-0 max-w-[760px] text-[clamp(2.2rem,5vw,4.5rem)] font-extrabold leading-none">
            {t.reliabilityTitle}
          </h2>
          <div className="grid grid-cols-3 gap-3.5 max-[980px]:grid-cols-1">
            {t.reliabilityItems.map((item) => (
              <article
                key={item.title}
                className="min-h-[180px] rounded-3xl border border-white/15 bg-white/[0.07] p-6"
              >
                <h3 className="m-0 text-[1.4rem] font-extrabold">{item.title}</h3>
                <p className="mt-2 leading-[1.65] text-white/75 rtl:leading-[1.9]">{item.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-5 rounded-3xl border border-[rgba(16,24,23,0.12)] bg-white/75 p-7 shadow-[0_16px_50px_rgba(16,24,23,0.08)] max-[760px]:grid-cols-1">
          <div>
            <h2 className="m-0 text-[clamp(1.8rem,3vw,2.6rem)] font-extrabold leading-tight">
              {t.ctaTitle}
            </h2>
            <p className="m-0 mt-2 max-w-[650px] leading-[1.65] text-[#4b5c56] rtl:leading-[1.9]">
              {t.ctaCopy}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--ns-accent)] px-5 font-extrabold text-white"
            >
              {t.ctaPrimary}
            </Link>
            <Link
              href="mailto:me@ahmedyassin.dev"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-[rgba(16,24,23,0.14)] bg-white px-5 font-extrabold"
            >
              {t.ctaSecondary}
            </Link>
          </div>
        </section>
      </section>
    </main>
  );
};

export default FeaturesPage;
