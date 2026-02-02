"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import dashboardCopy from "../../../../data/dashboard";
import { useDashboard } from "../../../../components/dashboard/DashboardShell";
import NoteEditor from "../../../../components/dashboard/NoteEditor";
import { Badge } from "../../../../components/ui/Badge";
import { Button } from "../../../../components/ui/Button";
import { Card } from "../../../../components/ui/Card";
import { Input } from "../../../../components/ui/Input";
import {
  createPost,
  generateDrafts,
  getNote,
  publishPost,
  schedulePost,
  updateNote,
} from "../../../../lib/api/notes";
import type { DraftResponse, NoteWithContentResponse } from "../../../../lib/api/types";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]";
const emptyStateClass =
  "rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]";

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
      <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <Card className={cardClass}>
          <div className={emptyStateClass}>{t.common.loading}</div>
        </Card>
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <Card className={cardClass}>
          <div className={emptyStateClass} role="alert">
            <p>{t.common.error}</p>
            <Button type="button" variant="outline" onClick={() => void loadNote()}>
              {t.common.retry}
            </Button>
          </div>
        </Card>
      </main>
    );
  }

  if (!note) {
    return (
      <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <Card className={cardClass}>
          <div className={emptyStateClass}>{t.common.error}</div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="m-0 text-[1.75rem] font-semibold leading-[1.2]">{note.title}</h1>
          <p className="m-0 text-[0.9rem] text-[#5b6474]">{t.note.editorTitle}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full" role="status" aria-live="polite">
            {status === "saving"
              ? t.shell.saving
              : status === "saved"
                ? t.shell.saved
                : status === "error"
                  ? t.shell.saveFailed
                  : t.shell.ready}
          </Badge>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] rtl:lg:grid-cols-[320px_minmax(0,1fr)]">
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

        <aside className="grid gap-4 rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-4">
          <div className="grid gap-2">
            <h3 className="m-0 text-[0.95rem] font-semibold">{t.note.draftsTitle}</h3>
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                size="pill"
                onClick={() => handleGenerateDraft("linkedin")}
                disabled={draftStatus === "loading"}
              >
                {t.note.generateLinkedIn}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="pill"
                onClick={() => handleGenerateDraft("medium")}
                disabled={draftStatus === "loading"}
              >
                {t.note.generateMedium}
              </Button>
            </div>
            {draftStatus === "loading" ? (
              <p className="m-0 text-[0.85rem] text-[#5b6474]">{t.common.loading}</p>
            ) : draftStatus === "error" ? (
              <p className="m-0 text-[0.85rem] text-[#5b6474]">{t.common.error}</p>
            ) : drafts.length === 0 ? (
              <p className="m-0 text-[0.85rem] text-[#5b6474]">{t.note.emptyDrafts}</p>
            ) : (
              <div className="grid gap-2.5">
                {drafts.map((draft) => (
                  <Button
                    type="button"
                    key={draft.postId}
                    variant="outline"
                    className={cn(
                      "h-auto w-full flex-col items-start gap-1 rounded-[12px] border border-[rgba(15,23,42,0.1)] bg-[#f9fafb] p-3 text-start",
                      selectedDraft?.postId === draft.postId &&
                        "border-[rgba(15,118,110,0.5)] bg-[rgba(15,118,110,0.08)]",
                    )}
                    onClick={() => setSelectedDraft(draft)}
                  >
                    <div className="text-[0.85rem] font-semibold">{draft.provider}</div>
                    <div className="text-[0.75rem] text-[#5b6474]">
                      {draft.content.slice(0, 120)}...
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-2">
            <h3 className="m-0 text-[0.95rem] font-semibold">{t.note.publishTitle}</h3>
            <div className="grid gap-2">
              <Button type="button" size="pill" onClick={handlePublish} disabled={!selectedDraft}>
                {t.note.publishNow}
              </Button>
              <Input
                className="rounded-[10px] border border-[rgba(15,23,42,0.1)] text-[0.95rem]"
                type="datetime-local"
                value={scheduleAt}
                onChange={(event) => setScheduleAt(event.target.value)}
                aria-label={t.note.scheduleTitle}
              />
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="pill"
                  onClick={handleSchedule}
                  disabled={!selectedDraft || !scheduleAt || !canSchedule}
                >
                  {t.note.schedule}
                </Button>
                {!canSchedule ? (
                  <Badge variant="secondary" className="rounded-full">
                    Pro
                  </Badge>
                ) : null}
              </div>
            </div>
            {!canSchedule ? (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-dashed border-[rgba(15,23,42,0.25)] bg-white p-3 text-[0.85rem] text-[#5b6474]">
                <span>{t.note.scheduleUpsell}</span>
                <a
                  className="font-semibold text-[var(--ns-accent)] hover:underline"
                  href="/dashboard/billing"
                >
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
