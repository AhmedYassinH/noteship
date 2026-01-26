"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dashboardCopy from "../../../data/dashboard";
import { useDashboard } from "../../../components/dashboard/DashboardShell";
import { createNote, listNotes } from "../../../lib/api/notes";
import type { NoteResponse } from "../../../lib/api/types";
import styles from "../dashboard.module.css";

const NotesPage = () => {
  const { lang, isAr, refreshNotes } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const router = useRouter();
  const [notes, setNotes] = useState<NoteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const statusClass = (status: NoteResponse["embeddingStatus"]) => {
    if (status === "ready") return styles.statusSuccess;
    if (status === "failed") return styles.statusDanger;
    return styles.statusWarning;
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
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{t.notes.title}</h1>
          <p className={styles.pageSubtitle}>{t.notes.subtitle}</p>
        </div>
        <div className={styles.inlineActions}>
          <button
            type="button"
            className={`${styles.pillButton} ${styles.primaryButton}`}
            onClick={handleCreate}
          >
            {t.notes.createCta}
          </button>
        </div>
      </div>

      <div className={styles.card}>
        {loading ? (
          <div className={styles.emptyState}>{t.common.loading}</div>
        ) : error ? (
          <div className={styles.emptyState} role="alert">
            <p>{t.common.error}</p>
            <button type="button" className={styles.pillButton} onClick={() => void loadNotes()}>
              {t.common.retry}
            </button>
          </div>
        ) : notes.length === 0 ? (
          <div className={styles.emptyState}>
            <strong>{t.notes.emptyTitle}</strong>
            <p className={styles.muted}>{t.notes.emptyCopy}</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t.table.title}</th>
                <th>{t.table.status}</th>
                <th>{t.table.updated}</th>
              </tr>
            </thead>
            <tbody>
              {notes.map((note) => (
                <tr key={note.noteId}>
                  <td>
                    <Link href={`/dashboard/notes/${note.noteId}`}>{note.title}</Link>
                  </td>
                  <td>
                    <span className={`${styles.statusPill} ${statusClass(note.embeddingStatus)}`}>
                      {note.embeddingStatus}
                    </span>
                  </td>
                  <td>{new Date(note.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
};

export default NotesPage;
