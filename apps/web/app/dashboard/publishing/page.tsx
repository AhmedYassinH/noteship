"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { listPosts } from "../../../lib/api/notes";
import type { PostResponse } from "../../../lib/api/types";
import styles from "../dashboard.module.css";

const PublishingPage = () => {
  const { lang, isAr, entitlements } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const statusClass = (status: PostResponse["status"]) => {
    if (status === "published") return styles.statusSuccess;
    if (status === "failed") return styles.statusDanger;
    if (status === "scheduled") return styles.statusWarning;
    return "";
  };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const response = await listPosts();
      setPosts(response.items);
    } catch {
      setPosts([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.publishing.title}</h1>
          <p className={styles.pageSubtitle}>{t.publishing.subtitle}</p>
        </div>
      </div>

      {!entitlements.canSchedule ? (
        <div className={styles.upsell}>
          <span>{t.publishing.upsell}</span>
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
            <button type="button" className={styles.pillButton} onClick={() => void loadPosts()}>
              {t.common.retry}
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>{t.publishing.empty}</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.table.note}</th>
                <th>{t.table.provider}</th>
                <th>{t.table.status}</th>
                <th>{t.table.updated}</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.postId}>
                  <td>
                    <Link href={`/dashboard/notes?noteId=${encodeURIComponent(post.noteId)}`}>
                      {post.noteId}
                    </Link>
                  </td>
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
    </main>
  );
};

export default PublishingPage;
