"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMarketingLanguage } from "../../../components/marketing/MarketingShell";
import featuresCopy from "../../../data/marketing-features";
import styles from "../marketing.module.css";

const FeaturesPage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => featuresCopy[lang], [lang]);
  const isAr = lang === "ar";

  return (
    <main className={styles.main} lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <section className={styles.hero}>
        <div>
          <p className={styles.heroKicker}>{t.heroKicker}</p>
          <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
          <p className={styles.heroLead}>{t.heroSub}</p>
          <div className={styles.heroActions}>
            <Link className={`${styles.actionButton} ${styles.actionPrimary}`} href="/login">
              {t.primaryCta}
            </Link>
            <Link className={`${styles.actionButton} ${styles.actionSecondary}`} href="/pricing">
              {t.secondaryCta}
            </Link>
          </div>
        </div>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>{t.workflowTitle}</h3>
          <div className={styles.timeline}>
            {t.workflowSteps.map((step, index) => (
              <div key={step.title} className={styles.timelineItem}>
                <div className={styles.timelineIndex}>{index + 1}</div>
                <div>
                  <strong>{step.title}</strong>
                  <p className={styles.timelineCopy}>{step.copy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="about">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.pillarsTitle}</h2>
          <p className={styles.sectionLead}>{t.pillarsLead}</p>
        </header>
        <div className={styles.cardGrid}>
          {t.pillars.map((pillar) => (
            <article key={pillar.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{pillar.title}</h3>
              <p className={styles.cardCopy}>{pillar.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="docs">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.deepDiveTitle}</h2>
          <p className={styles.sectionLead}>{t.deepDiveLead}</p>
        </header>
        <div className={styles.split}>
          {t.deepDive.map((item) => (
            <article key={item.title} className={styles.panel}>
              <h3 className={styles.panelTitle}>{item.title}</h3>
              <p className={styles.cardCopy}>{item.copy}</p>
              <ul className={styles.panelList}>
                {item.items.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="reliability">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.reliabilityTitle}</h2>
          <p className={styles.sectionLead}>{t.reliabilityLead}</p>
        </header>
        <div className={styles.cardGrid}>
          {t.reliabilityItems.map((item) => (
            <article key={item.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardCopy}>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="integrations">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.aboutTitle}</h2>
          <p className={styles.sectionLead}>{t.aboutCopy}</p>
        </header>
        <div className={styles.cardGrid}>
          <article className={styles.card} id="changelog">
            <h3 className={styles.cardTitle}>LinkedIn</h3>
            <p className={styles.cardCopy}>
              {isAr
                ? "نشر وجدولة مع حالات واضحة."
                : "Publish and schedule with clear status updates."}
            </p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>Medium</h3>
            <p className={styles.cardCopy}>
              {isAr
                ? "صياغة طويلة المدى من دون تبديل الأدوات."
                : "Long-form publishing without switching tools."}
            </p>
          </article>
          <article className={styles.card}>
            <h3 className={styles.cardTitle}>{isAr ? "المزيد قريباً" : "More soon"}</h3>
            <p className={styles.cardCopy}>
              {isAr ? "بوابات نشر إضافية حسب الحاجة." : "More publishing endpoints as you scale."}
            </p>
          </article>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <h2 className={styles.finalTitle}>{t.ctaTitle}</h2>
          <p className={styles.finalCopy}>{t.ctaCopy}</p>
        </div>
        <div className={styles.finalActions}>
          <Link className={`${styles.actionButton} ${styles.actionPrimary}`} href="/login">
            {t.ctaPrimary}
          </Link>
          <Link className={`${styles.actionButton} ${styles.actionSecondary}`} href="/pricing">
            {t.ctaSecondary}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default FeaturesPage;
