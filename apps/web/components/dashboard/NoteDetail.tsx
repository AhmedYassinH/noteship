"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PanelRight, X } from "lucide-react";
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
const DRAFTS_PANEL_OPEN_KEY = "noteship-drafts-panel-open";
const FOCUSABLE_SELECTOR =
  "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

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
  const [isDesktopPanel, setIsDesktopPanel] = useState<boolean | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);
  const [panelStateHydrated, setPanelStateHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const draftsTriggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileDraftsRef = useRef<HTMLElement | null>(null);

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
    const update = () => setIsDesktopPanel(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const storedOpen = window.localStorage.getItem(DRAFTS_PANEL_OPEN_KEY);
    setIsPanelOpen(storedOpen === null ? true : storedOpen === "true");
    setPanelStateHydrated(true);
  }, []);

  useEffect(() => {
    if (!panelStateHydrated) return;
    window.localStorage.setItem(DRAFTS_PANEL_OPEN_KEY, String(isPanelOpen));
  }, [isPanelOpen, panelStateHydrated]);

  useEffect(() => {
    if (isDesktopPanel !== false || !isPanelOpen) return;

    const panel = mobileDraftsRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const triggerElement = draftsTriggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      const firstFocusable = panel?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (firstFocusable ?? panel)?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsPanelOpen(false);
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (focusable.length === 0) {
        event.preventDefault();
        panel.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      (triggerElement ?? previouslyFocused)?.focus();
    };
  }, [isDesktopPanel, isPanelOpen]);

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

  const panelToggleLabel = isPanelOpen ? t.note.hideDrafts : t.note.showDrafts;

  const sidePanelContent = (
    <>
      <div className="grid gap-2">
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

  const draftsPanelContent = (
    <>
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[rgba(15,23,42,0.08)] px-4 py-3">
        <h2 className="m-0 text-base font-semibold">{t.note.draftsTitle}</h2>
        <div className="flex items-center gap-1">
          <Button
            aria-label={t.note.hideDrafts}
            className="h-9 w-9 rounded-full px-0"
            data-testid="note-drafts-close"
            onClick={() => setIsPanelOpen(false)}
            size="icon"
            title={t.note.hideDrafts}
            type="button"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
        {sidePanelContent}
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
    <main
      className="flex h-full min-h-[560px] flex-col gap-4"
      lang={lang}
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="m-0 text-[0.82rem] font-semibold uppercase text-[#5b6474]">
          {t.note.editorTitle}
        </p>
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
            onClick={() => setIsPanelOpen((open) => !open)}
            aria-label={panelToggleLabel}
            aria-controls="note-drafts-panel"
            aria-expanded={isPanelOpen}
            data-testid="note-side-panel-toggle"
            ref={draftsTriggerRef}
          >
            <PanelRight className="h-4 w-4" />
            <span className="max-[1100px]:hidden">{panelToggleLabel}</span>
          </Button>
        </div>
      </div>

      <div
        className={cn(
          "relative grid min-h-0 min-w-0 flex-1 gap-5",
          isDesktopPanel === true && isPanelOpen && "grid-cols-[minmax(0,1fr)_360px]",
        )}
      >
        <section className="min-h-0 min-w-0">
          <div className="h-full min-h-0">
            <NoteEditor
              key={noteId}
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

        {isDesktopPanel === true && isPanelOpen ? (
          <aside
            id="note-drafts-panel"
            className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white"
            data-testid="note-side-panel-inline"
          >
            {draftsPanelContent}
          </aside>
        ) : null}
      </div>

      {isDesktopPanel === false && isPanelOpen ? (
        <div
          className="fixed inset-0 z-50 bg-[rgba(15,23,42,0.38)]"
          data-testid="note-side-panel-overlay-backdrop"
          onMouseDown={() => setIsPanelOpen(false)}
        >
          <aside
            aria-label={t.note.draftsTitle}
            aria-modal="true"
            className="absolute inset-y-0 end-0 flex w-[min(92vw,360px)] flex-col overflow-hidden border-s border-[rgba(15,23,42,0.1)] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.25)]"
            data-testid="note-side-panel-overlay"
            id="note-drafts-panel"
            onMouseDown={(event) => event.stopPropagation()}
            ref={mobileDraftsRef}
            role="dialog"
            tabIndex={-1}
          >
            {draftsPanelContent}
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
