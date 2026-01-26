"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dashboardCopy from "../../../../data/dashboard";
import { useDashboard } from "../../../../components/dashboard/DashboardShell";
import NoteEditor from "../../../../components/dashboard/NoteEditor";
import {
  createPost,
  generateDrafts,
  getNote,
  publishPost,
  schedulePost,
  updateNote,
} from "../../../../lib/api/notes";
import type { DraftResponse, NoteWithContentResponse } from "../../../../lib/api/types";
import styles from "../../dashboard.module.css";

const NotePage = () => {
  const { noteId } = useParams<{ noteId: string }>();
  const { lang, isAr, entitlements } = useDashboard();
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [note, setNote] = useState<NoteWithContentResponse | null>(null);
  const [drafts, setDrafts] = useState<DraftResponse[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftResponse | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const canSchedule = entitlements.canSchedule;
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [draftStatus, setDraftStatus] = useState<"idle" | "loading" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadNote = useCallback(async () => {
    setLoadStatus("loading");
    try {
      const response = await getNote(noteId);
      setNote(response);
      setLoadStatus("ready");
    } catch {
      setNote(null);
      setLoadStatus("error");
    }
  }, [noteId]);

  useEffect(() => {
    void loadNote();
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [loadNote]);

  const scheduleSave = (updates: Partial<NoteWithContentResponse>) => {
    if (!note) return;
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    setStatus("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const updated = await updateNote(noteId, {
          title: updates.title ?? note.title,
          content: updates.content ?? note.content,
          editorFormat: "tiptap",
        });
        setNote(updated);
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 800);
  };

  const handleGenerateDraft = async (provider: "linkedin" | "medium") => {
    setDraftStatus("loading");
    try {
      const response = await generateDrafts(noteId, provider, undefined, lang);
      setDrafts(response.drafts);
      setSelectedDraft(response.drafts[0] ?? null);
      setDraftStatus("idle");
    } catch {
      setDrafts([]);
      setDraftStatus("error");
    }
  };

  const handlePublish = async () => {
    if (!selectedDraft) return;
    try {
      const post = await createPost({
        noteId,
        provider: selectedDraft.provider,
        content: selectedDraft.content,
      });
      await publishPost(post.postId);
    } catch {
      // ignore for now
    }
  };

  const handleSchedule = async () => {
    if (!selectedDraft || !scheduleAt) return;
    try {
      const post = await createPost({
        noteId,
        provider: selectedDraft.provider,
        content: selectedDraft.content,
      });
      await schedulePost(post.postId, new Date(scheduleAt).toISOString());
    } catch {
      // ignore
    }
  };

  if (loadStatus === "loading") {
    return (
      <main className={styles.card} lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <div className={styles.emptyState}>{t.common.loading}</div>
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className={styles.card} lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <div className={styles.emptyState} role="alert">
          <p>{t.common.error}</p>
          <button type="button" className={styles.pillButton} onClick={() => void loadNote()}>
            {t.common.retry}
          </button>
        </div>
      </main>
    );
  }

  if (!note) {
    return (
      <main className={styles.card} lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <div className={styles.emptyState}>{t.common.error}</div>
      </main>
    );
  }

  return (
    <main lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{note.title}</h1>
          <p className={styles.pageSubtitle}>{t.note.editorTitle}</p>
        </div>
        <div className={styles.inlineActions}>
          <span className={styles.badge} role="status" aria-live="polite">
            {status === "saving"
              ? t.shell.saving
              : status === "saved"
                ? t.shell.saved
                : status === "error"
                  ? t.shell.saveFailed
                  : t.shell.ready}
          </span>
        </div>
      </div>

      <div className={styles.pageSplit}>
        <NoteEditor
          noteId={noteId}
          title={note.title}
          content={note.content}
          onTitleChange={(value) => {
            setNote((prev) => (prev ? { ...prev, title: value } : prev));
            scheduleSave({ title: value });
          }}
          onContentChange={(value) => {
            setNote((prev) => (prev ? { ...prev, content: value } : prev));
            scheduleSave({ content: value });
          }}
          titlePlaceholder={t.note.titlePlaceholder}
          contentPlaceholder={t.note.contentPlaceholder}
          uploadLabel={t.note.uploadAsset}
          uploadingLabel={t.note.uploading}
          uploadFailedLabel={t.note.uploadFailed}
          dir={isAr ? "rtl" : "ltr"}
        />

        <aside className={styles.panel}>
          <div className={styles.panelSection}>
            <h3 className={styles.panelTitle}>{t.note.draftsTitle}</h3>
            <div className={styles.panelActions}>
              <button
                type="button"
                className={styles.pillButton}
                onClick={() => handleGenerateDraft("linkedin")}
                disabled={draftStatus === "loading"}
              >
                {t.note.generateLinkedIn}
              </button>
              <button
                type="button"
                className={styles.pillButton}
                onClick={() => handleGenerateDraft("medium")}
                disabled={draftStatus === "loading"}
              >
                {t.note.generateMedium}
              </button>
            </div>
            {draftStatus === "loading" ? (
              <p className={styles.muted}>{t.common.loading}</p>
            ) : draftStatus === "error" ? (
              <p className={styles.muted}>{t.common.error}</p>
            ) : drafts.length === 0 ? (
              <p className={styles.muted}>{t.note.emptyDrafts}</p>
            ) : (
              <div className={styles.panelList}>
                {drafts.map((draft) => (
                  <button
                    type="button"
                    key={draft.postId}
                    className={`${styles.panelItem} ${
                      selectedDraft?.postId === draft.postId ? styles.panelItemActive : ""
                    }`}
                    onClick={() => setSelectedDraft(draft)}
                  >
                    <div className={styles.panelItemTitle}>{draft.provider}</div>
                    <div className={styles.panelItemMeta}>{draft.content.slice(0, 120)}...</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={styles.panelSection}>
            <h3 className={styles.panelTitle}>{t.note.publishTitle}</h3>
            <div className={styles.panelActions}>
              <button
                type="button"
                className={`${styles.pillButton} ${styles.primaryButton}`}
                onClick={handlePublish}
                disabled={!selectedDraft}
              >
                {t.note.publishNow}
              </button>
              <input
                className={styles.input}
                type="datetime-local"
                value={scheduleAt}
                onChange={(event) => setScheduleAt(event.target.value)}
                aria-label={t.note.scheduleTitle}
              />
              <button
                type="button"
                className={styles.pillButton}
                onClick={handleSchedule}
                disabled={!selectedDraft || !scheduleAt || !canSchedule}
              >
                {t.note.schedule}
              </button>
              {!canSchedule ? <span className={styles.badge}>Pro</span> : null}
            </div>
            {!canSchedule ? (
              <div className={styles.upsell}>
                <span>{t.note.scheduleUpsell}</span>
                <a className={styles.upsellLink} href="/dashboard/billing">
                  {t.note.upgradeCta}
                </a>
              </div>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
};

export default NotePage;
