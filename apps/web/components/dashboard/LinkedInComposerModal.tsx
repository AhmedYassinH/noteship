"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../../data/dashboard";
import { ApiError } from "../../lib/api/client";
import { formatApiError } from "../../lib/api/errors";
import { createPost, publishPost, regenerateDraft, updatePostDraft } from "../../lib/api/notes";
import { editorUiCopy } from "../../data/note-editor";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import NoteEditor from "./NoteEditor";

type LinkedInComposerModalProps = {
  open: boolean;
  noteId: string;
  noteTitle: string;
  initialContent: string;
  lang: Lang;
  isAr: boolean;
  onClose: () => void;
};

const DEFAULT_LINKEDIN_MAX_CHARS = 3000;

const composerCopy: Record<
  Lang,
  {
    title: string;
    characters: string;
    saving: string;
    saveArtifact: string;
    saved: string;
    saveFailed: string;
    regenerate: string;
    scheduleSoon: string;
    publishing: string;
    publishNow: string;
    published: string;
    publishFailed: string;
    close: string;
    instructionPlaceholder: string;
    regenerating: string;
    apply: string;
    instructionRequired: string;
    regenerated: string;
    regenerateFailed: string;
    overflow: string;
    publishOverflow: string;
    titlePlaceholder: string;
    contentPlaceholder: string;
  }
> = {
  en: {
    title: "LinkedIn Composer",
    characters: "characters",
    saving: "Saving...",
    saveArtifact: "Save artifact",
    saved: "LinkedIn artifact saved.",
    saveFailed: "Failed to save draft artifact.",
    regenerate: "Regenerate with AI",
    scheduleSoon: "Schedule (Soon)",
    publishing: "Publishing...",
    publishNow: "Publish now",
    published: "Published to LinkedIn.",
    publishFailed: "Failed to publish.",
    close: "Close",
    instructionPlaceholder: "Add AI instructions (e.g., more concise, stronger CTA, Arabic tone).",
    regenerating: "Regenerating...",
    apply: "Apply",
    instructionRequired: "Add an instruction before regenerating.",
    regenerated: "Draft regenerated.",
    regenerateFailed: "Failed to regenerate draft.",
    overflow: "Draft exceeds single-post limit. You can publish overflow as comments.",
    publishOverflow: "Publish with overflow comments",
    titlePlaceholder: "LinkedIn draft title",
    contentPlaceholder: "Write your LinkedIn post...",
  },
  ar: {
    title: "محرر LinkedIn",
    characters: "حرف",
    saving: "جارٍ الحفظ...",
    saveArtifact: "حفظ المسودة",
    saved: "تم حفظ مسودة LinkedIn.",
    saveFailed: "تعذر حفظ المسودة.",
    regenerate: "إعادة التوليد بالذكاء الاصطناعي",
    scheduleSoon: "الجدولة قريبًا",
    publishing: "جارٍ النشر...",
    publishNow: "انشر الآن",
    published: "تم النشر على LinkedIn.",
    publishFailed: "فشل النشر.",
    close: "إغلاق",
    instructionPlaceholder: "أضف تعليمات للذكاء الاصطناعي مثل: اختصر، قوّ الدعوة للفعل.",
    regenerating: "جارٍ إعادة التوليد...",
    apply: "تطبيق",
    instructionRequired: "أضف تعليمات قبل إعادة التوليد.",
    regenerated: "تم تحديث المسودة.",
    regenerateFailed: "تعذرت إعادة توليد المسودة.",
    overflow: "تتجاوز المسودة حد المنشور الواحد. يمكنك نشر الباقي كتعليقات.",
    publishOverflow: "النشر مع تعليقات متتابعة",
    titlePlaceholder: "عنوان مسودة LinkedIn",
    contentPlaceholder: "اكتب منشور LinkedIn...",
  },
};

const LinkedInComposerModal = ({
  open,
  noteId,
  noteTitle,
  initialContent,
  lang,
  isAr,
  onClose,
}: LinkedInComposerModalProps) => {
  const [draftTitle, setDraftTitle] = useState("");
  const [content, setContent] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "overflow_comments">("single");
  const [instruction, setInstruction] = useState("");
  const [showInstruction, setShowInstruction] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [showOverflowAction, setShowOverflowAction] = useState(false);
  const copy = composerCopy[lang];
  const editorUi = editorUiCopy[lang];
  const charCount = useMemo(() => [...content].length, [content]);

  useEffect(() => {
    if (!open) return;
    setDraftTitle(`${noteTitle} · LinkedIn`);
    setContent(initialContent);
    setPostId(null);
    setMode("single");
    setInstruction("");
    setShowInstruction(false);
    setStatusMessage(null);
    setShowOverflowAction(false);
  }, [initialContent, noteTitle, open]);

  if (!open) {
    return null;
  }

  const ensureDraft = async (nextMode: "single" | "overflow_comments") => {
    if (postId) {
      const updated = await updatePostDraft(postId, { content, mode: nextMode });
      return updated.postId;
    }
    const created = await createPost({
      noteId,
      provider: "linkedin",
      content,
      mode: nextMode,
    });
    setPostId(created.postId);
    return created.postId;
  };

  const handleSaveArtifact = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    try {
      await ensureDraft(mode);
      setStatusMessage(copy.saved);
      setShowOverflowAction(false);
    } catch (error) {
      setStatusMessage(formatApiError(error, lang, copy.saveFailed));
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async (nextMode: "single" | "overflow_comments" = mode) => {
    setIsPublishing(true);
    setStatusMessage(null);
    try {
      const id = await ensureDraft(nextMode);
      await publishPost(id, { mode: nextMode });
      setStatusMessage(copy.published);
      setShowOverflowAction(false);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === "LINKEDIN_TOO_LONG") {
        setShowOverflowAction(true);
      }
      setStatusMessage(formatApiError(error, lang, copy.publishFailed));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!instruction.trim()) {
      setStatusMessage(copy.instructionRequired);
      return;
    }

    setIsRegenerating(true);
    setStatusMessage(null);
    try {
      const regenerated = await regenerateDraft(noteId, {
        provider: "linkedin",
        currentContent: content,
        instruction: instruction.trim(),
        language: lang,
      });
      setContent(regenerated.content);
      setStatusMessage(copy.regenerated);
    } catch (error) {
      setStatusMessage(formatApiError(error, lang, copy.regenerateFailed));
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-[rgba(15,23,42,0.55)] p-4" onClick={onClose}>
      <section
        className="mx-auto flex h-[94vh] w-full max-w-[1280px] flex-col gap-3 rounded-2xl border border-[rgba(15,23,42,0.15)] bg-white p-4 shadow-[0_24px_60px_rgba(15,23,42,0.3)]"
        lang={lang}
        dir={isAr ? "rtl" : "ltr"}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-[rgba(15,23,42,0.08)] pb-3">
          <div>
            <h2 className="m-0 text-xl font-semibold">{copy.title}</h2>
            <p className="m-0 text-xs text-[#5b6474]">{`${charCount}/${DEFAULT_LINKEDIN_MAX_CHARS} ${copy.characters}`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={handleSaveArtifact}
              disabled={isSaving || isPublishing || isRegenerating}
            >
              {isSaving ? copy.saving : copy.saveArtifact}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={() => setShowInstruction((prev) => !prev)}
              disabled={isPublishing || isSaving}
            >
              {copy.regenerate}
            </Button>
            <Button type="button" variant="outline" size="pill" disabled title="Coming soon">
              {copy.scheduleSoon}
            </Button>
            <Button
              type="button"
              size="pill"
              onClick={() => void handlePublish(mode)}
              disabled={isPublishing || isSaving || isRegenerating}
            >
              {isPublishing ? copy.publishing : copy.publishNow}
            </Button>
            <Button type="button" variant="outline" size="pill" onClick={onClose}>
              {copy.close}
            </Button>
          </div>
        </header>

        {showInstruction ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.12)] bg-[#f9fbfd] p-3">
            <Input
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder={copy.instructionPlaceholder}
              className="min-w-[260px] flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRegenerate()}
              disabled={isRegenerating || isPublishing || isSaving}
            >
              {isRegenerating ? copy.regenerating : copy.apply}
            </Button>
          </div>
        ) : null}

        {showOverflowAction ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.08)] p-3 text-sm text-[#7c5d10]">
            <span>{copy.overflow}</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("overflow_comments");
                void handlePublish("overflow_comments");
              }}
              disabled={isPublishing}
            >
              {copy.publishOverflow}
            </Button>
          </div>
        ) : null}

        {statusMessage ? (
          <div className="rounded-xl border border-[rgba(15,23,42,0.1)] bg-[#fcfdff] p-3 text-sm text-[#334155]">
            {statusMessage}
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-visible">
          <NoteEditor
            lang={lang}
            noteId={noteId}
            title={draftTitle}
            content={content}
            onTitleChange={setDraftTitle}
            onContentChange={setContent}
            titlePlaceholder={copy.titlePlaceholder}
            contentPlaceholder={copy.contentPlaceholder}
            uploadingLabel={editorUi.preparingEmbeddedAssets}
            uploadFailedLabel={editorUi.uploadExpired}
            editorDirection={isAr ? "rtl" : "ltr"}
          />
        </div>
      </section>
    </div>
  );
};

export default LinkedInComposerModal;
