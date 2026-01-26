"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { searchNotes } from "../../../lib/api/notes";
import type { SearchResponse } from "../../../lib/api/types";
import styles from "../dashboard.module.css";

const SearchPage = () => {
  const params = useSearchParams();
  const query = params?.get("q") ?? "";
  const { lang, isAr } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [results, setResults] = useState<SearchResponse["results"]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const runSearch = useCallback(async () => {
    if (!query) {
      setResults([]);
      setError(false);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const response = await searchNotes(query);
      setResults(response.results);
    } catch {
      setResults([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void runSearch();
  }, [runSearch]);

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.search.title}</h1>
          <p className={styles.pageSubtitle}>{t.search.subtitle}</p>
        </div>
        <span className={styles.badge}>
          {query ? `${results.length} ${t.search.resultsLabel}` : "0"}
        </span>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.emptyState}>{t.common.loading}</div>
        ) : error ? (
          <div className={styles.emptyState} role="alert">
            <p>{t.common.error}</p>
            <button type="button" className={styles.pillButton} onClick={() => void runSearch()}>
              {t.common.retry}
            </button>
          </div>
        ) : results.length === 0 ? (
          <div className={styles.emptyState}>{query ? t.search.empty : t.search.emptyQuery}</div>
        ) : (
          <div className={styles.grid}>
            {results.map((result) => (
              <article key={result.noteId} className={styles.panelItem}>
                <div className={styles.panelItemTitle}>
                  <Link href={`/dashboard/notes/${result.noteId}`}>{result.title}</Link>
                </div>
                <p className={styles.muted}>{result.preview ?? ""}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default SearchPage;
