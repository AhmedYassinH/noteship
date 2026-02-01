"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { listPosts } from "../../../lib/api/notes";
import type { PostResponse } from "../../../lib/api/types";
import styles from "../dashboard.module.css";

const DraftsPage = () => {
  const { lang, isAr, entitlements } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [drafts, setDrafts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const loadDrafts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await listPosts("draft");
      setDrafts(response.items);
    } catch {
      setDrafts([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDrafts();
  }, [loadDrafts]);

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.drafts.title}</h1>
          <p className={styles.pageSubtitle}>{t.drafts.subtitle}</p>
        </div>
      </div>

      {!entitlements.canSchedule ? (
        <div className={styles.upsell}>
          <span>{t.drafts.upsell}</span>
          <a className={styles.upsellLink} href="/dashboard/billing">
            {t.note.upgradeCta}
          </a>
        </div>
      ) : null}

      <div className={styles.card}>
        {loading ? (
          <div className={styles.emptyState}>{t.common.loading}</div>
        ) : error ? (
          <div className={styles.emptyState} role="alert">
            <p>{t.common.error}</p>
            <button type="button" className={styles.pillButton} onClick={() => void loadDrafts()}>
              {t.common.retry}
            </button>
          </div>
        ) : drafts.length === 0 ? (
          <div className={styles.emptyState}>{t.drafts.empty}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.table.note}</th>
                <th>{t.table.provider}</th>
                <th>{t.table.updated}</th>
              </tr>
            </thead>
            <tbody>
              {drafts.map((draft) => (
                <tr key={draft.postId}>
                  <td>
                    <Link href={`/dashboard/notes?noteId=${encodeURIComponent(draft.noteId)}`}>
                      {draft.noteId}
                    </Link>
                  </td>
                  <td>{draft.provider}</td>
                  <td>{new Date(draft.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default DraftsPage;
