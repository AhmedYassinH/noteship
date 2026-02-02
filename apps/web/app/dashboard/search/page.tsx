"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { searchNotes } from "../../../lib/api/notes";
import type { SearchResponse } from "../../../lib/api/types";

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
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.search.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.search.subtitle}</p>
        </div>
        <Badge variant="secondary" className="rounded-full">
          {query ? `${results.length} ${t.search.resultsLabel}` : "0"}
        </Badge>
      </div>

      <Card className="rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
            {t.common.loading}
          </div>
        ) : error ? (
          <div
            className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]"
            role="alert"
          >
            <p>{t.common.error}</p>
            <Button type="button" variant="outline" onClick={() => void runSearch()}>
              {t.common.retry}
            </Button>
          </div>
        ) : results.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
            {query ? t.search.empty : t.search.emptyQuery}
          </div>
        ) : (
          <div className="grid gap-3">
            {results.map((result) => (
              <article
                key={result.noteId}
                className="rounded-[12px] border border-[rgba(15,23,42,0.1)] bg-[#f9fafb] p-3 text-start"
              >
                <div className="text-[0.85rem] font-semibold">
                  <Link href={`/dashboard/notes/${result.noteId}`}>{result.title}</Link>
                </div>
                <p className="m-0 text-[0.85rem] text-[#5b6474]">{result.preview ?? ""}</p>
              </article>
            ))}
          </div>
        )}
      </Card>
    </main>
  );
};

export default SearchPage;
