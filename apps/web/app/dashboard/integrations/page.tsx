"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import {
  connectIntegration,
  disconnectIntegration,
  listIntegrations,
} from "../../../lib/api/notes";
import type { IntegrationAccountResponse, IntegrationProvider } from "../../../lib/api/types";
import styles from "../dashboard.module.css";

const providers: IntegrationProvider[] = ["linkedin", "medium"];

const IntegrationsPage = () => {
  const { lang, isAr } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [items, setItems] = useState<IntegrationAccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await listIntegrations();
      setItems(response.items);
    } catch {
      setItems([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleConnect = async (provider: IntegrationProvider) => {
    try {
      const response = await connectIntegration(provider, window.location.href);
      window.location.href = response.url;
    } catch {
      // ignore for now
    }
  };

  const handleDisconnect = async (provider: IntegrationProvider) => {
    try {
      await disconnectIntegration(provider);
      await load();
    } catch {
      // ignore
    }
  };

  const statusFor = (provider: IntegrationProvider) =>
    items.find((item) => item.provider === provider)?.status ?? "revoked";

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.integrations.title}</h1>
          <p className={styles.pageSubtitle}>{t.integrations.subtitle}</p>
        </div>
      </div>

      <div className={styles.grid}>
        {loading ? (
          <div className={styles.emptyState}>{t.common.loading}</div>
        ) : error ? (
          <div className={styles.emptyState} role="alert">
            <p>{t.common.error}</p>
            <button type="button" className={styles.pillButton} onClick={() => void load()}>
              {t.common.retry}
            </button>
          </div>
        ) : (
          providers.map((provider) => {
            const status = statusFor(provider);
            return (
              <div key={provider} className={styles.card}>
                <h2 className={styles.cardTitle}>{provider}</h2>
                <span className={styles.statusPill}>{status}</span>
                <div className={styles.inlineActions}>
                  {status === "connected" ? (
                    <button
                      type="button"
                      className={styles.pillButton}
                      onClick={() => handleDisconnect(provider)}
                    >
                      {t.integrations.disconnect}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.pillButton} ${styles.primaryButton}`}
                      onClick={() => handleConnect(provider)}
                    >
                      {t.integrations.connect}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </main>
  );
};

export default IntegrationsPage;
