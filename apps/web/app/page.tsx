"use client";

import { useMemo, useState } from "react";
import landingCopy, { Lang } from "../data/landing";
import HeaderBar from "../components/features/landing/HeaderBar";
import Hero from "../components/features/landing/Hero";
import Problem from "../components/features/landing/Problem";
import HowItWorks from "../components/features/landing/HowItWorks";
import Pillars from "../components/features/landing/Pillars";
import Proof from "../components/features/landing/Proof";
import Pricing from "../components/features/landing/Pricing";
import FAQ from "../components/features/landing/FAQ";
import FinalCta from "../components/features/landing/FinalCta";
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
        <HeaderBar lang={lang} onLangChange={setLang} copy={t} isAr={isAr} />
        <Hero copy={t} isAr={isAr} />
        <Problem copy={t} />
        <HowItWorks copy={t} />
        <Pillars copy={t} />
        <Proof copy={t} />
        <Pricing copy={t} />
        <FAQ copy={t} />
        <FinalCta copy={t} />
      </section>
    </main>
  );
};

export default HomePage;
