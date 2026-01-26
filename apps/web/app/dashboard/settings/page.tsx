"use client";

import { useMemo } from "react";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import LanguageToggle from "../../../components/ui/LanguageToggle";
import styles from "../dashboard.module.css";

const SettingsPage = () => {
  const { lang, setLang, isAr, me } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.settings.title}</h1>
          <p className={styles.pageSubtitle}>{t.settings.subtitle}</p>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t.settings.profile}</h2>
          <p className={styles.muted}>{me?.name ?? me?.email ?? "-"}</p>
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t.settings.language}</h2>
          <LanguageToggle lang={lang} onChange={setLang} />
        </div>
      </div>
    </main>
  );
};

export default SettingsPage;
