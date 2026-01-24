"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import landingCopy, { Lang } from "../data/landing";
import styles from "./page.module.css";

const HomePage = () => {
  const [lang, setLang] = useState<Lang>("en");
  const t = useMemo(() => landingCopy[lang], [lang]);
  const isAr = lang === "ar";

  return (
    <main
      className={`${styles.page} ${isAr ? styles.langAr : styles.langEn}`}
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
    >
      <section className={styles.shell}>
        <header className={`${styles.siteHeader} ${isAr ? styles.rtl : ""}`}>
          <Link href="/" className={styles.brand} aria-label="Noteship home">
            <div className={styles.brandMark}>
              <Image src="/noteship-mark.svg" alt="" width={50} height={50} priority />
            </div>
            <div className={styles.brandText}>
              <span className={styles.brandName}>Noteship</span>
              <span className={styles.brandTagline}>{t.brandTagline}</span>
            </div>
          </Link>

          <nav className={styles.nav} aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"}>
            {t.navLinks.map(link => (
              <a key={link.id} className={styles.navLink} href={`#${link.id}`}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className={styles.navActions}>
            <div className={styles.langToggle}>
              {["en", "ar"].map(code => (
                <button
                  key={code}
                  type="button"
                  className={`${styles.langButton} ${lang === code ? styles.langButtonActive : ""}`}
                  onClick={() => setLang(code as Lang)}
                  aria-pressed={lang === code}
                >
                  {code === "en" ? "English" : "العربية"}
                </button>
              ))}
            </div>
            <Link className={styles.navGhost} href="/login">
              {t.navCtaSecondary}
            </Link>
            <Link className={`${styles.primaryButton} ${styles.navPrimaryButton}`} href="/signup">
              {t.navCtaPrimary}
            </Link>
          </div>
        </header>

        <header className={`${styles.hero} ${isAr ? styles.rtl : ""}`}>
          <div className={styles.heroText}>
            <div className={styles.heroTopRow}>
              <p className={styles.kicker}>{t.heroKicker}</p>
            </div>
            <h1 className={styles.heroTitle}>{t.heroTitle}</h1>
            <p className={styles.heroSub}>{t.heroSub}</p>
            <div className={styles.ctaRow}>
              <button className={styles.primaryButton}>{t.primaryCta}</button>
              <button className={styles.secondaryButton}>{t.secondaryCta}</button>
            </div>
          </div>
          <div className={styles.heroMedia}>
            <Image
              src={t.heroImage}
              alt={t.heroImageAlt}
              width={1200}
              height={720}
              className={styles.mediaImg}
              priority
            />
          </div>
        </header>

        <section className={styles.section} id="problem">
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

        <section className={styles.section} id="how">
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
          <div className={styles.placeholder}>
            <Image
              src={t.heroImage}
              alt={t.heroImageAlt}
              width={1200}
              height={720}
              className={styles.mediaImg}
            />
          </div>
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

        <section className={styles.section} id="proof">
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
            <div className={styles.placeholder}>
              <Image
                src={t.proofImage}
                alt={t.proofImageAlt}
                width={1200}
                height={720}
                className={styles.mediaImg}
              />
            </div>
          </div>
        </section>

        <section className={styles.section} id="pricing">
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

        <section className={styles.section} id="faq">
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
