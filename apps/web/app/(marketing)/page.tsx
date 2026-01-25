"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMarketingLanguage } from "../../components/marketing/MarketingShell";
import homeCopy from "../../data/marketing-home";
import styles from "./marketing.module.css";

const HomePage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => homeCopy[lang], [lang]);
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
          <div className={styles.heroMetrics}>
            {t.heroHighlights.map((item) => (
              <div key={item.label} className={styles.metricCard}>
                <div className={styles.metricValue}>{item.value}</div>
                <div className={styles.metricLabel}>{item.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.heroMedia}>
          <Image
            src={t.heroImage}
            alt={t.heroImageAlt}
            width={520}
            height={420}
            className={styles.heroImage}
            priority
          />
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.highlightsTitle}</h2>
          <p className={styles.sectionLead}>{t.highlightsLead}</p>
        </header>
        <div className={styles.cardGrid}>
          {t.highlights.map((item) => (
            <article key={item.title} className={styles.card}>
              <h3 className={styles.cardTitle}>{item.title}</h3>
              <p className={styles.cardCopy}>{item.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.workflowTitle}</h2>
          <p className={styles.sectionLead}>{t.workflowLead}</p>
        </header>
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
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.proofTitle}</h2>
        </header>
        <div className={styles.cardGrid}>
          {t.proofStats.map((stat) => (
            <div key={stat.label} className={styles.card}>
              <div className={styles.metricValue}>{stat.value}</div>
              <div className={styles.metricLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.section} id="integrations">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.integrationsTitle}</h2>
          <p className={styles.sectionLead}>{t.integrationsLead}</p>
        </header>
        <div className={styles.cardGrid}>
          {t.integrations.map((integration) => (
            <article key={integration.name} className={styles.card}>
              <h3 className={styles.cardTitle}>{integration.name}</h3>
              <p className={styles.cardCopy}>{integration.copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section} id="pricing">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.pricingTitle}</h2>
          <p className={styles.sectionLead}>{t.pricingLead}</p>
        </header>
        <div className={styles.pricingGrid}>
          {t.pricingCards.map((plan) => (
            <article key={plan.name} className={styles.priceCard}>
              <div className={styles.priceName}>{plan.name}</div>
              <div className={styles.priceValue}>{plan.price}</div>
              <p className={styles.priceDesc}>{plan.desc}</p>
              <ul className={styles.priceList}>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className={`${styles.actionButton} ${styles.actionPrimary}`} href="/pricing">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.finalCta}>
        <div>
          <h2 className={styles.finalTitle}>{t.finalTitle}</h2>
          <p className={styles.finalCopy}>{t.finalCopy}</p>
        </div>
        <div className={styles.finalActions}>
          <Link className={`${styles.actionButton} ${styles.actionPrimary}`} href="/login">
            {t.finalPrimary}
          </Link>
          <Link className={`${styles.actionButton} ${styles.actionSecondary}`} href="/pricing">
            {t.finalSecondary}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
