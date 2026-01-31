"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dashboardCopy from "../../data/dashboard";
import { useDashboard } from "../../components/dashboard/DashboardShell";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { listPosts } from "../../lib/api/notes";
import type { PostResponse } from "../../lib/api/types";

const DashboardPage = () => {
  const { lang, isAr, recentNotes, recentNotesStatus, refreshNotes } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [publishing, setPublishing] = useState<PostResponse[]>([]);
  const [publishingStatus, setPublishingStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );

  const statusClass = (status: PostResponse["status"]) => {
    if (status === "published") return "bg-emerald-100 text-emerald-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    if (status === "scheduled") return "bg-amber-100 text-amber-700";
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
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.overview.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.overview.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="pill">
            <Link href="/dashboard/notes">{t.nav.notes}</Link>
          </Button>
          <Button asChild size="pill">
            <Link href="/dashboard/drafts">{t.nav.drafts}</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-3.5 [grid-template-columns:repeat(auto-fit,minmax(180px,1fr))]">
        {t.overview.stats.map((stat) => (
          <Card
            key={stat.label}
            className="rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]"
          >
            <p className="m-0 mb-2 text-[0.95rem] font-semibold">{stat.label}</p>
            <p className="m-0 text-[1.4rem] font-semibold">{stat.value}</p>
          </Card>
        ))}
      </section>

      <section className="grid gap-4">
        <Card className="rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <h2 className="m-0 mb-2 text-[0.95rem] font-semibold">{t.overview.recentNotes}</h2>
          {recentNotesStatus === "loading" ? (
            <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
              {t.common.loading}
            </div>
          ) : recentNotesStatus === "error" ? (
            <div
              className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]"
              role="alert"
            >
              <p>{t.common.error}</p>
              <Button type="button" variant="outline" onClick={() => void refreshNotes()}>
                {t.common.retry}
              </Button>
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
              {t.overview.emptyNotes}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase tracking-widest text-xs">
                    {t.table.note}
                  </TableHead>
                  <TableHead className="uppercase tracking-widest text-xs">
                    {t.table.updated}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentNotes.map((note) => (
                  <TableRow key={note.noteId}>
                    <TableCell>
                      <Link href={`/dashboard/notes/${note.noteId}`}>{note.title}</Link>
                    </TableCell>
                    <TableCell>{new Date(note.updatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
        <Card className="rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]">
          <h2 className="m-0 mb-2 text-[0.95rem] font-semibold">{t.overview.publishQueue}</h2>
          {publishingStatus === "loading" ? (
            <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
              {t.common.loading}
            </div>
          ) : publishingStatus === "error" ? (
            <div
              className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]"
              role="alert"
            >
              <p>{t.common.error}</p>
              <Button type="button" variant="outline" onClick={() => void loadPublishing()}>
                {t.common.retry}
              </Button>
            </div>
          ) : publishing.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
              {t.overview.emptyQueue}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="uppercase tracking-widest text-xs">
                    {t.table.provider}
                  </TableHead>
                  <TableHead className="uppercase tracking-widest text-xs">
                    {t.table.status}
                  </TableHead>
                  <TableHead className="uppercase tracking-widest text-xs">
                    {t.table.updated}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {publishing.slice(0, 4).map((post) => (
                  <TableRow key={post.postId}>
                    <TableCell>{post.provider}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`rounded-full ${statusClass(post.status)}`}
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(post.updatedAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </section>
    </main>
  );
};

export default DashboardPage;
