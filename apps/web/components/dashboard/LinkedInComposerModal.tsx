"use client";

import { useEffect, useMemo, useState } from "react";
import type { Lang } from "../../data/dashboard";
import { ApiError } from "../../lib/api/client";
import { createPost, publishPost, regenerateDraft, updatePostDraft } from "../../lib/api/notes";
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

const getLinkedInPublishErrorMessage = (error: unknown): string => {
  if (!(error instanceof ApiError)) {
    return error instanceof Error ? error.message : "Failed to publish.";
  }

  if (error.code === "LINKEDIN_TOO_MANY_IMAGES") {
    return "Too many images are embedded in this draft for one LinkedIn post. Remove extra images and try again.";
  }

  if (error.code === "LINKEDIN_MULTIPLE_PDFS_NOT_ALLOWED") {
    return "LinkedIn supports one PDF per post. Keep only one PDF in the draft and try again.";
  }

  if (error.code === "LINKEDIN_MEDIA_MIX_NOT_ALLOWED") {
    return "Use either images or one PDF in a post, not both together.";
  }

  if (error.code === "LINKEDIN_MEDIA_INVALID") {
    return "Only media embedded from this note can be published to LinkedIn.";
  }

  return error.message || "Failed to publish.";
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
      setStatusMessage("LinkedIn artifact saved.");
      setShowOverflowAction(false);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to save draft artifact.");
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
      setStatusMessage("Published to LinkedIn.");
      setShowOverflowAction(false);
      onClose();
    } catch (error) {
      if (error instanceof ApiError && error.code === "LINKEDIN_TOO_LONG") {
        setShowOverflowAction(true);
      }
      setStatusMessage(getLinkedInPublishErrorMessage(error));
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRegenerate = async () => {
    if (!instruction.trim()) {
      setStatusMessage("Add an instruction before regenerating.");
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
      setStatusMessage("Draft regenerated.");
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Failed to regenerate draft.");
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
            <h2 className="m-0 text-xl font-semibold">LinkedIn Composer</h2>
            <p className="m-0 text-xs text-[#5b6474]">{`${charCount}/${DEFAULT_LINKEDIN_MAX_CHARS} characters`}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={handleSaveArtifact}
              disabled={isSaving || isPublishing || isRegenerating}
            >
              {isSaving ? "Saving..." : "Save artifact"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="pill"
              onClick={() => setShowInstruction((prev) => !prev)}
              disabled={isPublishing || isSaving}
            >
              Regenerate with AI
            </Button>
            <Button type="button" variant="outline" size="pill" disabled title="Coming soon">
              Schedule (Soon)
            </Button>
            <Button
              type="button"
              size="pill"
              onClick={() => void handlePublish(mode)}
              disabled={isPublishing || isSaving || isRegenerating}
            >
              {isPublishing ? "Publishing..." : "Publish now"}
            </Button>
            <Button type="button" variant="outline" size="pill" onClick={onClose}>
              Close
            </Button>
          </div>
        </header>

        {showInstruction ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[rgba(15,23,42,0.12)] bg-[#f9fbfd] p-3">
            <Input
              value={instruction}
              onChange={(event) => setInstruction(event.target.value)}
              placeholder="Add AI instructions (e.g., more concise, stronger CTA, Arabic tone)."
              className="min-w-[260px] flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleRegenerate()}
              disabled={isRegenerating || isPublishing || isSaving}
            >
              {isRegenerating ? "Regenerating..." : "Apply"}
            </Button>
          </div>
        ) : null}

        {showOverflowAction ? (
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[rgba(245,158,11,0.4)] bg-[rgba(245,158,11,0.08)] p-3 text-sm text-[#7c5d10]">
            <span>Draft exceeds single-post limit. You can publish overflow as comments.</span>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMode("overflow_comments");
                void handlePublish("overflow_comments");
              }}
              disabled={isPublishing}
            >
              Publish with overflow comments
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
            titlePlaceholder="LinkedIn draft title"
            contentPlaceholder="Write your LinkedIn post..."
            uploadLabel="Upload"
            uploadingLabel="Uploading..."
            uploadFailedLabel="Upload failed"
            editorDirection={isAr ? "rtl" : "ltr"}
          />
        </div>
      </section>
    </div>
  );
};

export default LinkedInComposerModal;
