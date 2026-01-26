"use client";

import { useMemo } from "react";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { createPortalSession } from "../../../lib/api/notes";
import styles from "../dashboard.module.css";

const BillingPage = () => {
  const { lang, isAr, me } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);

  const handlePortal = async () => {
    try {
      const response = await createPortalSession(window.location.href);
      window.location.href = response.url;
    } catch {
      // ignore
    }
  };

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.billing.title}</h1>
          <p className={styles.pageSubtitle}>{t.billing.subtitle}</p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.grid}>
          <div>
            <p className={styles.cardTitle}>{t.billing.currentPlanLabel}</p>
            <p className={styles.statValue}>{me?.planId ?? "free"}</p>
            <p className={styles.muted}>{me?.subscriptionStatus ?? t.billing.defaultStatus}</p>
          </div>
          <div className={styles.inlineActions}>
            <button
              type="button"
              className={`${styles.pillButton} ${styles.primaryButton}`}
              onClick={handlePortal}
            >
              {t.billing.upgrade}
            </button>
            <button type="button" className={styles.pillButton} onClick={handlePortal}>
              {t.billing.manage}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BillingPage;
