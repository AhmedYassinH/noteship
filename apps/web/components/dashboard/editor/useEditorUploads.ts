import { useCallback, useState, type ChangeEvent, type RefObject } from "react";
import type { Editor } from "@tiptap/react";
import { ApiError } from "../../../lib/api/client";
import { createContentSession, createNoteUpload } from "../../../lib/api/notes";
import type { EditorUiStrings } from "../../../data/note-editor";
import type { ArtifactType, UploadIntent } from "./editorTypes";
import {
  MAX_IMAGE_BYTES,
  MAX_IMPORT_BYTES,
  MAX_PDF_ATTACHMENT_BYTES,
  MAX_PDF_EMBED_BYTES,
} from "./editorText";
import { noteshipDirectivesToEditorHtml } from "./richNodes";

type UseEditorUploadsArgs = {
  editor: Editor | null;
  noteId: string;
  fileInputRef: RefObject<HTMLInputElement>;
  ui: EditorUiStrings;
  uploadFailedLabel: string;
};

type PendingUpload = {
  intent: UploadIntent;
  artifactType: ArtifactType;
};

const fileAcceptFor = (artifactType: ArtifactType): string =>
  artifactType === "image" ? "image/*" : "application/pdf";

export const useEditorUploads = ({
  editor,
  noteId,
  fileInputRef,
  ui,
  uploadFailedLabel,
}: UseEditorUploadsArgs) => {
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [pendingUpload, setPendingUpload] = useState<PendingUpload | null>(null);
  const [fileAccept, setFileAccept] = useState("image/*,application/pdf");

  const openUploadPicker = useCallback(
    (intent: UploadIntent, artifactType: ArtifactType) => {
      const accept = fileAcceptFor(artifactType);
      setPendingUpload({ intent, artifactType });
      setFileAccept(accept);
      if (fileInputRef.current) {
        fileInputRef.current.accept = accept;
      }
      fileInputRef.current?.click();
    },
    [fileInputRef],
  );

  const insertAttachment = useCallback(
    (name: string, href: string, mime: string, sizeBytes: number) => {
      if (!editor) return;
      editor
        .chain()
        .focus()
        .insertContent({
          type: "attachmentBlock",
          attrs: { href, name, mime, sizeBytes: String(sizeBytes), align: "start" },
        })
        .run();
    },
    [editor],
  );

  const rejectUpload = useCallback((message: string) => {
    setUploadState("error");
    setStatusMessage(message);
  }, []);

  const handleUploadFile = useCallback(
    async (file: File | null, intent: UploadIntent, artifactType: ArtifactType) => {
      if (!file || !editor) return;
      if (file.type.startsWith("video/")) {
        rejectUpload(ui.videoUploadsUnsupported);
        return;
      }
      if (artifactType === "image" && !file.type.startsWith("image/")) {
        rejectUpload(ui.selectImageFile);
        return;
      }
      if (artifactType === "pdf" && file.type !== "application/pdf") {
        rejectUpload(ui.selectPdfFile);
        return;
      }
      if (artifactType === "image" && file.size > MAX_IMAGE_BYTES) {
        rejectUpload(ui.imageUploadLimit);
        return;
      }
      if (artifactType === "pdf" && intent === "embed" && file.size > MAX_PDF_EMBED_BYTES) {
        rejectUpload(ui.embeddedPdfLimit);
        return;
      }
      if (artifactType === "pdf" && intent === "attach" && file.size > MAX_PDF_ATTACHMENT_BYTES) {
        rejectUpload(ui.attachedPdfLimit);
        return;
      }

      setUploadState("uploading");
      setStatusMessage(null);
      try {
        const response = await createNoteUpload(noteId, {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
          intent,
          artifactType,
        });
        const uploadResponse = await fetch(response.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!uploadResponse.ok) {
          throw new Error(uploadFailedLabel);
        }

        await createContentSession();

        if (artifactType === "image" && intent === "embed") {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "image",
              attrs: {
                src: response.publicUrl,
                alt: file.name,
                widthPreset: "medium",
                align: "start",
              },
            })
            .run();
        } else if (artifactType === "pdf" && intent === "embed") {
          editor
            .chain()
            .focus()
            .insertContent({
              type: "pdfEmbed",
              attrs: {
                src: response.publicUrl,
                title: file.name,
                widthPreset: "medium",
                align: "start",
              },
            })
            .run();
          setStatusMessage(ui.pdfSemanticSearchNote);
        } else {
          insertAttachment(
            file.name,
            response.publicUrl,
            file.type || "application/octet-stream",
            file.size,
          );
          if (artifactType === "pdf") {
            setStatusMessage(ui.pdfSemanticSearchNote);
          }
        }
        setUploadState("idle");
      } catch (error) {
        setUploadState("error");
        setStatusMessage(error instanceof ApiError ? error.message : uploadFailedLabel);
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    },
    [editor, fileInputRef, insertAttachment, noteId, rejectUpload, ui, uploadFailedLabel],
  );

  const handleUploadInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] || null;
      if (pendingUpload) {
        void handleUploadFile(file, pendingUpload.intent, pendingUpload.artifactType);
      }
      setPendingUpload(null);
    },
    [handleUploadFile, pendingUpload],
  );

  return {
    fileAccept,
    handleUploadInputChange,
    openUploadPicker,
    setStatusMessage,
    statusMessage,
    uploadState,
  };
};

export const importMarkdownFile = async (
  file: File | null,
  editor: Editor | null,
  ui: Pick<EditorUiStrings, "markdownImportLimit" | "markdownImported">,
  setStatusMessage: (message: string) => void,
): Promise<void> => {
  if (!file || !editor) return;
  if (file.size > MAX_IMPORT_BYTES) {
    setStatusMessage(ui.markdownImportLimit);
    return;
  }
  const text = await file.text();
  editor.commands.setContent(noteshipDirectivesToEditorHtml(text));
  setStatusMessage(ui.markdownImported);
};
