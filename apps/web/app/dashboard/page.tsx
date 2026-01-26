"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dashboardCopy from "../../data/dashboard";
import { useDashboard } from "../../components/dashboard/DashboardShell";
import { listPosts } from "../../lib/api/notes";
import type { PostResponse } from "../../lib/api/types";
import styles from "./dashboard.module.css";

const DashboardPage = () => {
  const { lang, isAr, recentNotes, recentNotesStatus, refreshNotes } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [publishing, setPublishing] = useState<PostResponse[]>([]);
  const [publishingStatus, setPublishingStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const statusClass = (status: PostResponse["status"]) => {
    if (status === "published") return styles.statusSuccess;
    if (status === "failed") return styles.statusDanger;
    if (status === "scheduled") return styles.statusWarning;
    return "";
  };

  const loadPublishing = useCallback(async () => {
    setPublishingStatus("loading");
    try {
      const result = await listPosts();
      setPublishing(result.items);
      setPublishingStatus("ready");
    } catch {
      setPublishing([]);
      setPublishingStatus("error");
    }
  }, []);

  useEffect(() => {
    void loadPublishing();
  }, [loadPublishing]);

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.overview.title}</h1>
          <p className={styles.pageSubtitle}>{t.overview.subtitle}</p>
        </div>
        <div className={styles.inlineActions}>
          <Link className={styles.pillButton} href="/dashboard/notes">
            {t.nav.notes}
          </Link>
          <Link className={`${styles.pillButton} ${styles.primaryButton}`} href="/dashboard/drafts">
            {t.nav.drafts}
          </Link>
        </div>
      </div>

      <section className={styles.statGrid}>
        {t.overview.stats.map((stat) => (
          <div key={stat.label} className={styles.card}>
            <p className={styles.cardTitle}>{stat.label}</p>
            <p className={styles.statValue}>{stat.value}</p>
          </div>
        ))}
      </section>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t.overview.recentNotes}</h2>
          {recentNotesStatus === "loading" ? (
            <div className={styles.emptyState}>{t.common.loading}</div>
          ) : recentNotesStatus === "error" ? (
            <div className={styles.emptyState} role="alert">
              <p>{t.common.error}</p>
              <button
                type="button"
                className={styles.pillButton}
                onClick={() => void refreshNotes()}
              >
                {t.common.retry}
              </button>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className={styles.emptyState}>{t.overview.emptyNotes}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.table.note}</th>
                  <th>{t.table.updated}</th>
                </tr>
              </thead>
              <tbody>
                {recentNotes.map((note) => (
                  <tr key={note.noteId}>
                    <td>
                      <Link href={`/dashboard/notes/${note.noteId}`}>{note.title}</Link>
                    </td>
                    <td>{new Date(note.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{t.overview.publishQueue}</h2>
          {publishingStatus === "loading" ? (
            <div className={styles.emptyState}>{t.common.loading}</div>
          ) : publishingStatus === "error" ? (
            <div className={styles.emptyState} role="alert">
              <p>{t.common.error}</p>
              <button
                type="button"
                className={styles.pillButton}
                onClick={() => void loadPublishing()}
              >
                {t.common.retry}
              </button>
            </div>
          ) : publishing.length === 0 ? (
            <div className={styles.emptyState}>{t.overview.emptyQueue}</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t.table.provider}</th>
                  <th>{t.table.status}</th>
                  <th>{t.table.updated}</th>
                </tr>
              </thead>
              <tbody>
                {publishing.slice(0, 4).map((post) => (
                  <tr key={post.postId}>
                    <td>{post.provider}</td>
                    <td>
                      <span className={`${styles.statusPill} ${statusClass(post.status)}`}>
                        {post.status}
                      </span>
                    </td>
                    <td>{new Date(post.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
};

export default DashboardPage;
