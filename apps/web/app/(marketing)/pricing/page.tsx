"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useMarketingLanguage } from "../../../components/marketing/MarketingShell";
import pricingCopy from "../../../data/marketing-pricing";
import styles from "../marketing.module.css";

const PricingPage = () => {
  const { lang } = useMarketingLanguage();
  const t = useMemo(() => pricingCopy[lang], [lang]);
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
            <Link
              className={`${styles.actionButton} ${styles.actionSecondary}`}
              href="/pricing#faq"
            >
              {t.secondaryCta}
            </Link>
          </div>
        </div>
        <div className={styles.panel}>
          <h3 className={styles.panelTitle}>{t.plansTitle}</h3>
          <p className={styles.cardCopy}>{t.plansLead}</p>
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.plansTitle}</h2>
          <p className={styles.sectionLead}>{t.plansLead}</p>
        </header>
        <div className={styles.pricingGrid}>
          {t.plans.map((plan) => (
            <article key={plan.name} className={styles.priceCard}>
              {plan.badge ? <span className={styles.priceBadge}>{plan.badge}</span> : null}
              <div className={styles.priceName}>{plan.name}</div>
              <div className={styles.priceValue}>{plan.price}</div>
              <p className={styles.priceDesc}>{plan.desc}</p>
              <ul className={styles.priceList}>
                {plan.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <Link className={`${styles.actionButton} ${styles.actionPrimary}`} href="/login">
                {plan.cta}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.comparisonTitle}</h2>
          <p className={styles.sectionLead}>{t.comparisonLead}</p>
        </header>
        <div className={styles.panel}>
          <table className={styles.comparisonTable}>
            <thead>
              <tr>
                <th>{isAr ? "الميزة" : "Feature"}</th>
                <th>{isAr ? "مجاني" : "Free"}</th>
                <th>{isAr ? "برو" : "Pro"}</th>
              </tr>
            </thead>
            <tbody>
              {t.comparison.map((row) => (
                <tr key={row.feature}>
                  <td>{row.feature}</td>
                  <td>{row.free}</td>
                  <td>{row.pro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={styles.section} id="faq">
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>{t.faqTitle}</h2>
        </header>
        <div className={styles.faqGrid}>
          {t.faq.map((item) => (
            <div key={item.q} className={styles.faqItem}>
              <p className={styles.faqQ}>{item.q}</p>
              <p className={styles.faqA}>{item.a}</p>
            </div>
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
          <Link className={`${styles.actionButton} ${styles.actionSecondary}`} href="/features">
            {t.finalSecondary}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PricingPage;
