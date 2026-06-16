"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMarketingLanguage } from "../../../components/marketing/MarketingShell";
import { Button } from "../../../components/ui/Button";
import featuresCopy from "../../../data/marketing-features";

const FeaturesPage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => featuresCopy[lang], [lang]);
  const isAr = lang === "ar";

  return (
    <main
      className="flex flex-col gap-16 text-left rtl:text-right"
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
    >
      <section className="grid gap-4 border-b border-[rgba(15,23,42,0.12)] pb-10">
        <p className="m-0 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-[var(--ns-muted)]">
          {t.heroKicker}
        </p>
        <h1 className="m-0 max-w-[18ch] font-headline text-[clamp(2.2rem,4.2vw,3.15rem)] leading-[1.14]">
          {t.heroTitle}
        </h1>
        <p className="m-0 max-w-[58ch] text-[1.02rem] text-[var(--ns-muted)] leading-[1.72] rtl:leading-[1.9]">
          {t.heroSub}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" size="pill" asChild>
            <Link href="/login">{t.primaryCta}</Link>
          </Button>
          <Button type="button" size="pill" variant="outline" asChild>
            <Link href="/pricing">{t.secondaryCta}</Link>
          </Button>
        </div>
      </section>

      <section className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
        {t.sections.map((section) => (
          <article
            key={section.title}
            className="grid gap-2 rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-5 shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
          >
            <h2 className="m-0 font-headline text-[1.25rem] leading-[1.25]">{section.title}</h2>
            <p className="m-0 text-[0.95rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
              {section.copy}
            </p>
            <ul className="m-0 mt-1 grid list-disc gap-1.5 pl-4 text-[0.92rem] text-[var(--ns-muted)] rtl:pl-0 rtl:pr-4">
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="grid gap-4">
        <h2 className="m-0 font-headline text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.2]">
          {t.reliabilityTitle}
        </h2>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
          {t.reliabilityItems.map((item) => (
            <article
              key={item.title}
              className="border border-[rgba(15,23,42,0.1)] bg-white px-5 py-4"
            >
              <h3 className="m-0 text-[1rem] font-semibold">{item.title}</h3>
              <p className="m-0 mt-1 text-[0.94rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
                {item.copy}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid items-center gap-4 border border-[rgba(15,23,42,0.12)] bg-white px-6 py-7 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <div>
          <h2 className="m-0 font-headline text-[1.55rem] leading-[1.22]">{t.ctaTitle}</h2>
          <p className="m-0 mt-2 text-[0.95rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
            {t.ctaCopy}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3 rtl:justify-start">
          <Button type="button" size="pill" asChild>
            <Link href="/login">{t.ctaPrimary}</Link>
          </Button>
          <Button type="button" size="pill" variant="ghost" asChild>
            <Link href="mailto:me@ahmedyassin.dev">{t.ctaSecondary}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default FeaturesPage;
