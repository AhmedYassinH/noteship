"use client";

import type { ReactNode } from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import sharedCopy, { Lang } from "../../data/marketing-shared";
import LanguageToggle from "../ui/LanguageToggle";
import Button from "../ui/Button";
import styles from "../../app/(marketing)/marketing.module.css";

type MarketingLanguageState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
};

const MarketingLanguageContext = createContext<MarketingLanguageState | undefined>(undefined);

export const useMarketingLanguage = () => {
  const ctx = useContext(MarketingLanguageContext);
  if (!ctx) {
    throw new Error("useMarketingLanguage must be used within MarketingShell");
  }
  return ctx;
};

const MarketingShell = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>("en");
  const pathname = usePathname();
  const copy = useMemo(() => sharedCopy[lang], [lang]);
  const isAr = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = isAr ? "rtl" : "ltr";
  }, [lang, isAr]);

  return (
    <MarketingLanguageContext.Provider value={{ lang, setLang }}>
      <div className={`${styles.page} ${isAr ? styles.langAr : styles.langEn}`}>
        <header className={styles.header}>
          <Link href="/" className={styles.brand} aria-label="Noteship home">
            <span className={styles.brandMark}>
              <Image src="/noteship-mark.svg" alt="" width={44} height={44} priority />
            </span>
            <span className={styles.brandText}>
              <span className={styles.brandName}>Noteship</span>
              <span className={styles.brandTagline}>{copy.brandTagline}</span>
            </span>
          </Link>

          <nav className={styles.nav} aria-label={isAr ? "التنقل الرئيسي" : "Main navigation"}>
            {copy.navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  className={`${styles.navLink} ${isActive ? styles.navLinkActive : ""}`}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className={styles.navActions}>
            <LanguageToggle lang={lang} onChange={setLang} />
            <Link className={styles.navGhost} href="/login">
              {copy.ctas.secondary}
            </Link>
            <Button className={styles.navPrimaryButton}>{copy.ctas.primary}</Button>
          </div>
        </header>

        <div className={styles.content}>{children}</div>

        <footer className={styles.footer}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogoRow}>
              <Image src="/noteship-mark.svg" alt="" width={36} height={36} />
              <span className={styles.footerName}>Noteship</span>
            </div>
            <p className={styles.footerSummary}>{copy.footer.summary}</p>
          </div>

          <div className={styles.footerColumns}>
            {copy.footer.columns.map((column) => (
              <div key={column.title} className={styles.footerColumn}>
                <span className={styles.footerTitle}>{column.title}</span>
                {column.links.map((link) => (
                  <Link key={link.href} href={link.href} className={styles.footerLink}>
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          <div className={styles.footerBottom}>{copy.footer.bottom}</div>
        </footer>
      </div>
    </MarketingLanguageContext.Provider>
  );
};

export default MarketingShell;
