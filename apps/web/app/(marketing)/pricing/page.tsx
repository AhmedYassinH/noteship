"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMarketingLanguage } from "../../../components/marketing/MarketingShell";
import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import pricingCopy from "../../../data/marketing-pricing";

const PricingPage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => pricingCopy[lang], [lang]);
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
              <Link href="/pricing#faq">{t.secondaryCta}</Link>
            </Button>
          </div>
        </div>
        <div className="rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white/95 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
          <h3 className="m-0 mb-2 text-[0.95rem] font-semibold font-headline leading-[1.25]">
            {t.plansTitle}
          </h3>
          <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
            {t.plansLead}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.plansTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.plansLead}
          </p>
        </header>
        <div className="grid gap-[18px] [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]">
          {t.plans.map((plan) => (
            <article
              key={plan.name}
              className="grid gap-3 rounded-[22px] border border-[rgba(15,23,42,0.08)] bg-white p-[22px] shadow-[0_20px_40px_rgba(15,23,42,0.1)]"
            >
              {plan.badge ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(15,118,110,0.12)] px-2.5 py-1 text-[0.78rem] uppercase tracking-[0.2em] text-[var(--ns-accent-strong)]">
                  {plan.badge}
                </span>
              ) : null}
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
                <Link href="/login">{plan.cta}</Link>
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.comparisonTitle}
          </h2>
          <p className="m-0 text-[1rem] leading-[1.7] text-[var(--ns-muted)] rtl:leading-[1.85]">
            {t.comparisonLead}
          </p>
        </header>
        <div className="rounded-[20px] border border-[rgba(15,23,42,0.08)] bg-white p-5 shadow-[0_16px_32px_rgba(15,23,42,0.08)]">
          <div className="overflow-hidden rounded-[18px] border border-[rgba(15,23,42,0.08)] bg-white">
            <Table>
              <TableHeader className="bg-[#f5f7fa]">
                <TableRow>
                  <TableHead className="font-semibold">{isAr ? "الميزة" : "Feature"}</TableHead>
                  <TableHead className="font-semibold">{isAr ? "مجاني" : "Free"}</TableHead>
                  <TableHead className="font-semibold">{isAr ? "برو" : "Pro"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {t.comparison.map((row) => (
                  <TableRow key={row.feature}>
                    <TableCell>{row.feature}</TableCell>
                    <TableCell>{row.free}</TableCell>
                    <TableCell>{row.pro}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6" id="faq">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.6vw,2.1rem)] font-semibold leading-[1.25]">
            {t.faqTitle}
          </h2>
        </header>
        <div className="grid gap-3.5">
          {t.faq.map((item) => (
            <div
              key={item.q}
              className="rounded-[16px] border border-[rgba(15,23,42,0.08)] bg-white p-4"
            >
              <p className="m-0 mb-1.5 font-semibold font-headline leading-[1.25]">{item.q}</p>
              <p className="m-0 text-[var(--ns-muted)] leading-[1.6] rtl:leading-[1.85]">
                {item.a}
              </p>
            </div>
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
            <Link href="/features">{t.finalSecondary}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
