"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { createNote, listNotes } from "../../../lib/api/notes";
import type { NoteResponse } from "../../../lib/api/types";

const NotesPage = () => {
  const { lang, isAr, refreshNotes } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const router = useRouter();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const statusClass = (status: NoteResponse["embeddingStatus"]) => {
    if (status === "ready") return "bg-emerald-100 text-emerald-700";
    if (status === "failed") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await listNotes();
      setNotes(result.items);
    } catch {
      setNotes([]);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  const handleCreate = async () => {
    try {
      const response = await createNote({
        title: isAr ? "ملاحظة جديدة" : "New note",
        content: "",
        editorFormat: "tiptap",
      });
      await refreshNotes();
      router.push(`/dashboard/notes/${response.noteId}`);
    } catch {
      // ignore for now
    }
  };

  return (
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{t.notes.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.notes.subtitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="pill" onClick={handleCreate}>
            {t.notes.createCta}
          </Button>
        </div>
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
            <Button type="button" variant="outline" onClick={() => void loadNotes()}>
              {t.common.retry}
            </Button>
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]">
            <strong>{t.notes.emptyTitle}</strong>
            <p className="m-0 text-[0.85rem] text-[#5b6474]">{t.notes.emptyCopy}</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="uppercase tracking-widest text-xs">{t.table.title}</TableHead>
                <TableHead className="uppercase tracking-widest text-xs">
                  {t.table.status}
                </TableHead>
                <TableHead className="uppercase tracking-widest text-xs">
                  {t.table.updated}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {notes.map((note) => (
                <TableRow key={note.noteId}>
                  <TableCell>
                    <Link href={`/dashboard/notes/${note.noteId}`}>{note.title}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={`rounded-full ${statusClass(note.embeddingStatus)}`}
                    >
                      {note.embeddingStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(note.updatedAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </main>
  );
};

export default NotesPage;
