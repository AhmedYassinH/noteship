"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  useMarketingLanguage,
  useWaitlistModal,
} from "../../../components/marketing/MarketingShell";
import { Button } from "../../../components/ui/Button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import pricingCopy from "../../../data/marketing-pricing";

const PricingPage = () => {
  const { lang } = useMarketingLanguage();
  const { openWaitlist } = useWaitlistModal();
  const t = useMemo(() => pricingCopy[lang], [lang]);
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
        <h1 className="m-0 max-w-[17ch] font-headline text-[clamp(2.2rem,4.2vw,3.15rem)] leading-[1.14]">
          {t.heroTitle}
        </h1>
        <p className="m-0 max-w-[58ch] text-[1.02rem] text-[var(--ns-muted)] leading-[1.72] rtl:leading-[1.9]">
          {t.heroSub}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" size="pill" onClick={openWaitlist}>
            {t.primaryCta}
          </Button>
          <Button type="button" size="pill" variant="outline" asChild>
            <Link href="/#how-it-works">{t.secondaryCta}</Link>
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.2]">
            {t.plansTitle}
          </h2>
          <p className="m-0 text-[1rem] text-[var(--ns-muted)] leading-[1.72] rtl:leading-[1.9]">
            {t.plansLead}
          </p>
        </header>
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(250px,1fr))]">
          {t.plans.map((plan, index) => (
            <article
              key={plan.name}
              className="grid gap-3 rounded-xl border border-[rgba(15,23,42,0.1)] bg-white p-6 shadow-[0_6px_20px_rgba(15,23,42,0.06)]"
            >
              {plan.badge ? (
                <span className="inline-flex w-fit items-center rounded-full bg-[rgba(15,118,110,0.12)] px-2.5 py-1 text-[0.74rem] font-semibold tracking-[0.06em] text-[var(--ns-accent-strong)]">
                  {plan.badge}
                </span>
              ) : null}
              <div className="text-[1.05rem] font-semibold">{plan.name}</div>
              <div className="text-[1.95rem] font-semibold">{plan.price}</div>
              <p className="m-0 text-[0.95rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
                {plan.desc}
              </p>
              <ul className="m-0 grid list-disc gap-1.5 pl-4 text-[0.92rem] text-[var(--ns-muted)] rtl:pl-0 rtl:pr-4">
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Button
                type="button"
                size="pill"
                variant={index === 0 ? "outline" : "default"}
                onClick={openWaitlist}
              >
                {plan.cta}
              </Button>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="grid gap-2">
          <h2 className="m-0 font-headline text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.2]">
            {t.comparisonTitle}
          </h2>
          <p className="m-0 text-[1rem] text-[var(--ns-muted)] leading-[1.72] rtl:leading-[1.9]">
            {t.comparisonLead}
          </p>
        </header>
        <div className="overflow-hidden rounded-xl border border-[rgba(15,23,42,0.12)] bg-white">
          <Table>
            <TableHeader className="bg-[#f8f9fb]">
              <TableRow>
                <TableHead className="font-semibold">{isAr ? "الميزة" : "Feature"}</TableHead>
                <TableHead className="font-semibold">{isAr ? "مجاني" : "Free"}</TableHead>
                <TableHead className="font-semibold">Pro</TableHead>
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
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="m-0 font-headline text-[clamp(1.6rem,2.8vw,2.2rem)] leading-[1.2]">
          {t.faqTitle}
        </h2>
        <div className="grid gap-3">
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
        </div>
      </section>

      <section className="grid items-center gap-4 border border-[rgba(15,23,42,0.12)] bg-white px-6 py-7 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
        <div>
          <h2 className="m-0 font-headline text-[1.55rem] leading-[1.22]">{t.finalTitle}</h2>
          <p className="m-0 mt-2 text-[0.95rem] text-[var(--ns-muted)] leading-[1.65] rtl:leading-[1.85]">
            {t.finalCopy}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-3 rtl:justify-start">
          <Button type="button" size="pill" onClick={openWaitlist}>
            {t.finalPrimary}
          </Button>
          <Button type="button" size="pill" variant="ghost" asChild>
            <Link href="mailto:me@ahmedyassin.dev">{t.finalSecondary}</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
