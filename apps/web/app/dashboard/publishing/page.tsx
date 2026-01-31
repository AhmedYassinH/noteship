"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { listPosts } from "../../../lib/api/notes";
import type { PostResponse } from "../../../lib/api/types";

const PublishingPage = () => {
  const { lang, isAr, entitlements } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [posts, setPosts] = useState<PostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const statusClass = (status: PostResponse["status"]) => {
    if (status === "published") return "bg-emerald-100 text-emerald-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    if (status === "scheduled") return "bg-amber-100 text-amber-700";
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
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.publishing.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.publishing.subtitle}</p>
        </div>
      </div>

      {!entitlements.canSchedule ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-dashed border-[rgba(15,23,42,0.25)] bg-white p-3 text-[0.85rem] text-[#5b6474]">
          <span>{t.publishing.upsell}</span>
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
            <Button type="button" variant="outline" onClick={() => void loadPosts()}>
              {t.common.retry}
            </Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
            {t.publishing.empty}
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
                  {t.table.status}
                </TableHead>
                <TableHead className="uppercase tracking-widest text-xs">
                  {t.table.updated}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.postId}>
                  <TableCell>
                    <Link href={`/dashboard/notes/${post.noteId}`}>{post.noteId}</Link>
                  </TableCell>
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
    </main>
  );
};

export default PublishingPage;
