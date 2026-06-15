import type { Editor } from "@tiptap/react";
import type { EditorUiStrings } from "../../../data/note-editor";

export const MAX_IMPORT_BYTES = 500 * 1024;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PDF_EMBED_BYTES = 1 * 1024 * 1024;
export const MAX_PDF_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export const getCurrentMarkdown = (editor: Editor): string =>
  editor.storage.markdown?.getMarkdown?.() ?? editor.getText({ blockSeparator: "\n" });

export const countWords = (value: string): number => {
  const words = value.trim().match(/\S+/g);
  return words ? words.length : 0;
};

export const bytesForText = (value: string): number => new TextEncoder().encode(value).length;

export const formatBytes = (
  bytes: number,
  labels: Pick<EditorUiStrings, "bytesLabel" | "kbLabel">,
): string => {
  if (bytes < 1024) {
    return `${bytes} ${labels.bytesLabel}`;
  }
  return `${(bytes / 1024).toFixed(1)} ${labels.kbLabel}`;
};

export const triggerDownload = (filename: string, markdown: string): void => {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const referencesProtectedContent = (markdown: string): boolean => {
  const contentDomain = process.env.NEXT_PUBLIC_CONTENT_DOMAIN?.trim();
  if (!contentDomain) return false;

  return (
    markdown.includes(`https://${contentDomain}/`) || markdown.includes(`http://${contentDomain}/`)
  );
};
