"use client";

import { useMemo, useState } from "react";
import styles from "./page.module.css";

type Lang = "en" | "ar";

type SectionCopy = {
  heroKicker: string;
  heroTitle: string;
  heroSub: string;
  primaryCta: string;
  secondaryCta: string;
  heroPlaceholder: string;
  problemTitle: string;
  problemBullets: string[];
  howTitle: string;
  howSteps: { title: string; copy: string }[];
  pillarsTitle: string;
  pillars: { title: string; copy: string }[];
  proofTitle: string;
  proofStats: { label: string; value: string }[];
  proofPlaceholder: string;
  pricingTitle: string;
  pricingSub: string;
  plans: { name: string; price: string; items: string[]; cta: string }[];
  faqTitle: string;
  faq: { q: string; a: string }[];
  finalTitle: string;
  finalCopy: string;
};

const copy: Record<Lang, SectionCopy> = {
  en: {
    heroKicker: "Semantic notes to published posts",
    heroTitle: "Find any idea by meaning. Publish in your voice—without rewrites.",
    heroSub:
      "Noteship helps consultants and coaches turn Markdown notes into LinkedIn and Medium posts with semantic recall, tone control, and reliable scheduling.",
    primaryCta: "Start drafting",
    secondaryCta: "Watch 90s overview",
    heroPlaceholder:
      "Placeholder: clean product hero showing semantic search results on the left and a LinkedIn draft on the right, English UI",
    problemTitle: "Built for people who don't want to rewrite from scratch",
    problemBullets: [
      "You remember the idea, not the exact words.",
      "You need LinkedIn/Medium posts that keep your tone.",
      "You want scheduling that just works (and retries)."
    ],
    howTitle: "How Noteship works",
    howSteps: [
      { title: "Capture once", copy: "Write in TipTap, autosave to Markdown, attach artifacts." },
      { title: "Index by meaning", copy: "Background embeddings keep search fresh after each edit." },
      { title: "Draft + publish", copy: "Generate posts in your tone, publish now or schedule." }
    ],
    pillarsTitle: "Why it stays portable",
    pillars: [
      { title: "Markdown first", copy: "Canonical content in S3, easy export/import." },
      { title: "Semantic search", copy: "Find notes by meaning, not exact keywords." },
      { title: "On-brand drafts", copy: "Tone controls keep your voice consistent." },
      { title: "Reliable scheduling", copy: "Retries and clear statuses for LinkedIn/Medium." }
    ],
    proofTitle: "Proof points",
    proofStats: [
      { label: "Minutes to first draft", value: "<5" },
      { label: "Platforms at launch", value: "2" },
      { label: "Export format", value: "Markdown" }
    ],
    proofPlaceholder: "Placeholder: annotated screenshot of Arabic UI mirrored, showing publish status timeline",
    pricingTitle: "Pricing",
    pricingSub: "Start free. Upgrade for scheduling and higher AI limits.",
    plans: [
      {
        name: "Free",
        price: "Starter",
        items: ["Semantic search", "Markdown export", "AI drafts (low quota)", "Manual publish"],
        cta: "Start free"
      },
      {
        name: "Pro",
        price: "$18/mo",
        items: ["Higher AI drafts", "Scheduling", "Retries + status", "More notes & storage"],
        cta: "Upgrade"
      }
    ],
    faqTitle: "FAQ",
    faq: [
      { q: "Can I export my notes?", a: "Yes. Noteship stores Markdown; export anytime." },
      { q: "Which platforms are supported?", a: "LinkedIn and Medium at launch, more later." },
      { q: "Is scheduling paid?", a: "Scheduling is Pro-only; manual publish is in Free." }
    ],
    finalTitle: "Ready to ship your ideas?",
    finalCopy: "Find by meaning, draft fast, publish with confidence."
  },
  ar: {
    heroKicker: "??????? ?????? ??? ??????? ?????",
    heroTitle: "???? ??? ?? ???? ???????. ???? ????? ??? ????? ?????.",
    heroSub:
      "?????? ????? ?????????? ????????? ??? ????? ????????? ??? ??????? ???????/?????? ?? ??? ?????? ???? ?? ??????? ?????? ??????.",
    primaryCta: "???? ????????",
    secondaryCta: "???? ??? ?? ?????",
    heroPlaceholder:
      "???? ????: ???? ????? ?????? ????? ?? ????? ??? ????? ??? ?????? ?????? ??????? ??? ?????? (RTL)",
    problemTitle: "??? ?? ???? ????? ??????? ?? ???",
    problemBullets: [
      "????? ?????? ?? ??????? ??????.",
      "????? ??????? ???????/?????? ????? ??? ??????.",
      "???? ????? ???? ????? (???????? ?????)."
    ],
    howTitle: "??? ???? ??????",
    howSteps: [
      { title: "????? ???", copy: "???? ?? TipTap ?? ??? ?????? ??? Markdown ???????." },
      { title: "????? ???????", copy: "????? ???????? ??? ?? ????? ????? ????? ??????." },
      { title: "????? ????", copy: "???? ??????? ???????? ???? ???? ?? ?????." }
    ],
    pillarsTitle: "????? ??? ?????? ?????",
    pillars: [
      { title: "Markdown ?????", copy: "????? ????? ?? S3 ?? ?????/??????? ???." },
      { title: "??? ?????", copy: "???? ??? ????????? ??????? ?? ???????? ?????????." },
      { title: "?????? ??? ??????", copy: "???? ?? ?????? ????? ???? ??????." },
      { title: "????? ??????", copy: "??????? ????? ?????? ????? ????????/??????." }
    ],
    proofTitle: "?????",
    proofStats: [
      { label: "????? ???? ?????", value: "<?" },
      { label: "????? ??? ???????", value: "?" },
      { label: "???? ???????", value: "Markdown" }
    ],
    proofPlaceholder: "???? ????: ???? ????? ?? ?? ???? ?????? ????? ??????? RTL",
    pricingTitle: "???????",
    pricingSub: "???? ??????. ???? ??????? ???? ???? ????.",
    plans: [
      {
        name: "?????",
        price: "?????",
        items: ["??? ?????", "????? Markdown", "??? ?????? ????????", "??? ????"],
        cta: "???? ??????"
      },
      {
        name: "???",
        price: "$18 / ???",
        items: ["??? ???? ????????", "?????", "??????? ????? + ?????", "??????? ?????? ????"],
        cta: "?????"
      }
    ],
    faqTitle: "??????? ???????",
    faq: [
      { q: "?? ?????? ????? ??????????", a: "???? ?????? ???? Markdown ????? ??????? ?? ?? ???." },
      { q: "?? ??????? ?????????", a: "??????? ??????? ??? ???????? ?????? ??????." },
      { q: "?? ??????? ???????", a: "??????? ??? ???? ????? ?????? ???? ?? ???????." }
    ],
    finalTitle: "???? ???? ???????",
    finalCopy: "???? ???????? ??? ?????? ????? ????."
  }
};

const HomePage = () => {
  const [lang, setLang] = useState<Lang>("en");
  const t = useMemo(() => copy[lang], [lang]);
  const isAr = lang === "ar";

  return (
    <main
      className={`${styles.page} ${isAr ? styles.langAr : styles.langEn}`}
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
    >
      <section className={styles.shell}>
        <header className={`${styles.hero} ${isAr ? styles.rtl : ""}`}>
          <div className={styles.heroText}>
            <div className={styles.heroTopRow}>
              <p className={styles.kicker}>{t.heroKicker}</p>
              <div className={styles.langToggle}>
                {(["en", "ar"] as Lang[]).map(code => (
                  <button
                    key={code}
                    type="button"
                    className={`${styles.langButton} ${lang === code ? styles.langButtonActive : ""}`}
                    onClick={() => setLang(code)}
                    aria-pressed={lang === code}
                  >
                    {code === "en" ? "English" : "???????"}
                  </button>
                ))}
              </div>
            </div>
            <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
            <p className={styles.heroSub}>{t.heroSub}</p>
            <div className={styles.ctaRow}>
              <button className={styles.primaryButton}>{t.primaryCta}</button>
              <button className={styles.secondaryButton}>{t.secondaryCta}</button>
            </div>
          </div>
          <div className={styles.heroMedia}>{t.heroPlaceholder}</div>
        </header>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.problemTitle}</h2>
          </div>
          <ul className={styles.bulletList}>
            {t.problemBullets.map(item => (
              <li key={item} className={styles.bulletItem}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.howTitle}</h2>
          </div>
          <div className={styles.steps}>
            {t.howSteps.map((step, idx) => (
              <div key={step.title} className={styles.step}>
                <span className={styles.stepIndex}>{String(idx + 1).padStart(2, "0")}</span>
                <div>
                  <div className={styles.stepTitle}>{step.title}</div>
                  <p className={styles.stepCopy}>{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
          <div className={styles.placeholder}>{t.heroPlaceholder}</div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.pillarsTitle}</h2>
          </div>
          <div className={styles.pillars}>
            {t.pillars.map(pillar => (
              <article key={pillar.title} className={styles.pillar}>
                <h3 className={styles.pillarTitle}>{pillar.title}</h3>
                <p className={styles.pillarCopy}>{pillar.copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.proofTitle}</h2>
          </div>
          <div className={styles.proofRow}>
            <div className={styles.stats}>
              {t.proofStats.map(stat => (
                <div key={stat.label} className={styles.stat}>
                  <div className={styles.statValue}>{stat.value}</div>
                  <div className={styles.statLabel}>{stat.label}</div>
                </div>
              ))}
            </div>
            <div className={styles.placeholder}>{t.proofPlaceholder}</div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.pricingTitle}</h2>
            <p className={styles.sectionLead}>{t.pricingSub}</p>
          </div>
          <div className={styles.pricing}>
            {t.plans.map(plan => (
              <article key={plan.name} className={styles.priceCard}>
                <div className={styles.priceHeader}>
                  <div className={styles.priceName}>{plan.name}</div>
                  <div className={styles.priceValue}>{plan.price}</div>
                </div>
                <ul className={styles.priceList}>
                  {plan.items.map(item => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button className={styles.primaryButton}>{plan.cta}</button>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
          </div>
          <div className={styles.faq}> 
            {t.faq.map(item => (
              <article key={item.q} className={styles.faqItem}>
                <h3 className={styles.faqQ}>{item.q}</h3>
                <p className={styles.faqA}>{item.a}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.finalCta}>
          <div>
            <h3 className={styles.finalTitle}>{t.finalTitle}</h3>
            <p className={styles.finalCopy}>{t.finalCopy}</p>
          </div>
          <div className={styles.ctaActions}>
            <button className={styles.primaryButton}>{t.primaryCta}</button>
            <button className={styles.secondaryButton}>{t.secondaryCta}</button>
          </div>
        </section>
      </section>
    </main>
  );
};

export default HomePage;
