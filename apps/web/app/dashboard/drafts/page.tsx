"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/Table";
import { listPosts } from "../../../lib/api/notes";
import type { PostResponse } from "../../../lib/api/types";

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
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.drafts.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.drafts.subtitle}</p>
        </div>
      </div>

      {!entitlements.canSchedule ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-dashed border-[rgba(15,23,42,0.25)] bg-white p-3 text-[0.85rem] text-[#5b6474]">
          <span>{t.drafts.upsell}</span>
          <a
            className="font-semibold text-[var(--ns-accent)] hover:underline"
            href="/dashboard/billing"
          >
            {t.note.upgradeCta}
          </a>
        </div>
      ) : null}

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
            <Button type="button" variant="outline" onClick={() => void loadDrafts()}>
              {t.common.retry}
            </Button>
          </div>
        ) : drafts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
            {t.drafts.empty}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase tracking-widest text-xs">{t.table.note}</TableHead>
                <TableHead className="uppercase tracking-widest text-xs">
                  {t.table.provider}
                </TableHead>
                <TableHead className="uppercase tracking-widest text-xs">
                  {t.table.updated}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {drafts.map((draft) => (
                <TableRow key={draft.postId}>
                  <TableCell>
                    <Link href={`/dashboard/notes/${draft.noteId}`}>{draft.noteId}</Link>
                  </TableCell>
                  <TableCell>{draft.provider}</TableCell>
                  <TableCell>{new Date(draft.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </main>
  );
};

export default DraftsPage;
