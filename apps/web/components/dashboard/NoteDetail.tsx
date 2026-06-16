"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelRight } from "lucide-react";
import dashboardCopy from "../../data/dashboard";
import { useDashboard } from "../../components/dashboard/DashboardShell";
import NoteEditor from "../../components/dashboard/NoteEditor";
import LinkedInComposerModal from "../../components/dashboard/LinkedInComposerModal";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { createPost, getNote, publishPost, schedulePost, updateNote } from "../../lib/api/notes";
import { formatApiError } from "../../lib/api/errors";
import type { DraftResponse, NoteWithContentResponse } from "../../lib/api/types";
import { cn } from "@/lib/utils";

const cardClass =
  "rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-[18px] shadow-[0_10px_28px_rgba(15,23,42,0.08)]";
const emptyStateClass =
  "rounded-2xl border border-dashed border-[rgba(15,23,42,0.2)] p-6 text-center text-[#5b6474]";

type NoteDetailProps = {
  noteId: string;
};

const NoteDetail = ({ noteId }: NoteDetailProps) => {
  const { lang, isAr, entitlements } = useDashboard();
  const editorDirection = isAr ? "rtl" : "ltr";
  const t = useMemo(() => dashboardCopy[lang], [lang]);
  const [note, setNote] = useState<NoteWithContentResponse | null>(null);
  const [drafts, setDrafts] = useState<DraftResponse[]>([]);
  const [selectedDraft, setSelectedDraft] = useState<DraftResponse | null>(null);
  const [scheduleAt, setScheduleAt] = useState("");
  const canSchedule = entitlements.canSchedule;
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [loadStatus, setLoadStatus] = useState<"loading" | "ready" | "error">("loading");
  const [draftStatus, setDraftStatus] = useState<"idle" | "loading" | "error">("idle");
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isLinkedInComposerOpen, setIsLinkedInComposerOpen] = useState(false);
  const [isDesktopPanel, setIsDesktopPanel] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
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
    if (!noteId) return;
    setDrafts([]);
    setSelectedDraft(null);
    setScheduleAt("");
    setStatus("idle");
    setDraftStatus("idle");
    setActionMessage(null);
    setIsLinkedInComposerOpen(false);
    void loadNote();
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
    };
  }, [loadNote, noteId]);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const syncPanelMode = () => {
      const nextIsDesktop = media.matches;
      setIsDesktopPanel(nextIsDesktop);
      setIsPanelOpen(nextIsDesktop);
    };
    syncPanelMode();
    media.addEventListener("change", syncPanelMode);
    return () => media.removeEventListener("change", syncPanelMode);
  }, []);

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
        setNote((prev) => (prev ? { ...prev, ...updated } : prev));
        setStatus("saved");
      } catch {
        setStatus("error");
      }
    }, 800);
  };

  const handleGenerateDraft = () => {
    setActionMessage(null);
    setIsLinkedInComposerOpen(true);
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
      setActionMessage(t.note.publishQueued);
    } catch (error) {
      setActionMessage(formatApiError(error, lang, t.note.publishFailed));
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
      await schedulePost(post.postId, new Date(scheduleAt).toISOString(), {
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
      setActionMessage(t.note.scheduleSaved);
    } catch (error) {
      setActionMessage(formatApiError(error, lang, t.note.scheduleFailed));
    }
  };

  const panelToggleLabel = isPanelOpen
    ? isAr
      ? "إخفاء اللوحة"
      : "Hide panel"
    : isAr
      ? "إظهار اللوحة"
      : "Show panel";

  const sidePanelContent = (
    <>
      <div className="grid gap-2">
        <h3 className="m-0 text-[0.95rem] font-semibold">{t.note.draftsTitle}</h3>
        <div className="grid gap-2">
          <Button
            type="button"
            variant="outline"
            size="pill"
            onClick={handleGenerateDraft}
            disabled={draftStatus === "loading"}
          >
            {t.note.generateLinkedIn}
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
                {t.note.comingSoonBadge}
              </Badge>
            ) : null}
          </div>
        </div>
        {actionMessage ? (
          <p className="m-0 rounded-[12px] border border-[rgba(15,23,42,0.1)] bg-[#f9fafb] p-3 text-[0.85rem] text-[#5b6474]">
            {actionMessage}
          </p>
        ) : null}
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
    </>
  );

  if (loadStatus === "loading") {
    return (
      <main className="flex h-full min-h-0 flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <Card className={cardClass}>
          <div className={emptyStateClass}>{t.common.loading}</div>
        </Card>
      </main>
    );
  }

  if (loadStatus === "error") {
    return (
      <main className="flex h-full min-h-0 flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
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
      <main className="flex h-full min-h-0 flex-col gap-6" lang={lang} dir={isAr ? "rtl" : "ltr"}>
        <Card className={cardClass}>
          <div className={emptyStateClass}>{t.common.error}</div>
        </Card>
      </main>
    );
  }

  return (
    <main className="flex h-full min-h-0 flex-col gap-4" lang={lang} dir={isAr ? "rtl" : "ltr"}>
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
          <Button
            type="button"
            variant="outline"
            size="pill"
            onClick={() => setIsPanelOpen((prev) => !prev)}
            aria-controls="note-side-panel"
            aria-expanded={isPanelOpen}
            data-testid="note-side-panel-toggle"
          >
            <PanelRight className="h-4 w-4" />
            <span className="max-[1100px]:hidden">{panelToggleLabel}</span>
          </Button>
        </div>
      </div>

      <div className="relative grid min-h-0 flex-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className={cn("min-h-0", isDesktopPanel && !isPanelOpen && "lg:col-span-2")}>
          <div
            className={cn("h-full min-h-0", isDesktopPanel && isPanelOpen && "lg:max-w-[880px]")}
          >
            <NoteEditor
              lang={lang}
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
              uploadingLabel={t.note.uploading}
              uploadFailedLabel={t.note.uploadFailed}
              editorDirection={editorDirection}
            />
          </div>
        </section>

        {isDesktopPanel && isPanelOpen ? (
          <aside
            id="note-side-panel"
            className="hidden min-h-0 flex-col gap-4 overflow-y-auto rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white p-4 lg:flex"
            data-testid="note-side-panel-inline"
          >
            {sidePanelContent}
          </aside>
        ) : null}
      </div>

      {!isDesktopPanel && isPanelOpen ? (
        <div
          className="fixed inset-0 z-40 bg-[rgba(15,23,42,0.35)] lg:hidden"
          onClick={() => setIsPanelOpen(false)}
          data-testid="note-side-panel-overlay-backdrop"
        >
          <aside
            id="note-side-panel"
            className="absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col gap-3 overflow-y-auto border-s border-[rgba(15,23,42,0.1)] bg-white p-4 shadow-[0_20px_48px_rgba(15,23,42,0.25)]"
            onClick={(event) => event.stopPropagation()}
            data-testid="note-side-panel-overlay"
          >
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={() => setIsPanelOpen(false)}
            >
              <PanelRight className="h-4 w-4" />
              {panelToggleLabel}
            </Button>
            {sidePanelContent}
          </aside>
        </div>
      ) : null}

      <LinkedInComposerModal
        open={isLinkedInComposerOpen}
        noteId={noteId}
        noteTitle={note.title}
        initialContent={note.content}
        lang={lang}
        isAr={isAr}
        onClose={() => setIsLinkedInComposerOpen(false)}
      />
    </main>
  );
};

export default NoteDetail;
