"use client";

import { useEffect, useRef, useState } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import EditorToolbar from "./EditorToolbar";
import { Input } from "../ui/input";
import { createNoteUpload } from "../../lib/api/notes";
import { cn } from "@/lib/utils";

type Props = {
  noteId: string;
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  titlePlaceholder: string;
  contentPlaceholder: string;
  uploadLabel: string;
  uploadingLabel: string;
  uploadFailedLabel: string;
  dir?: "ltr" | "rtl";
};

const NoteEditor = ({
  noteId,
  title,
  content,
  onTitleChange,
  onContentChange,
  titlePlaceholder,
  contentPlaceholder,
  uploadLabel,
  uploadingLabel,
  uploadFailedLabel,
  dir,
}: Props) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle");
  const [isReady, setIsReady] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        codeBlock: {},
      }),
      Image.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: contentPlaceholder }),
      Markdown.configure({ html: false }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "min-h-[320px] rounded-[10px] border border-[rgba(15,23,42,0.1)] bg-white px-3.5 py-3 text-[0.95rem] leading-relaxed",
          "[&_h1]:text-[1.5rem] [&_h1]:leading-[1.2] [&_h2]:text-[1.25rem] [&_h2]:leading-[1.3]",
          "[&_blockquote]:border-l-4 [&_blockquote]:border-[rgba(15,118,110,0.4)] [&_blockquote]:pl-3 [&_blockquote]:text-[#5b6474]",
          "rtl:[&_blockquote]:border-l-0 rtl:[&_blockquote]:pl-0 rtl:[&_blockquote]:border-r-4 rtl:[&_blockquote]:pr-3",
          "[&_.is-editor-empty]:before:content-[attr(data-placeholder)]",
          "[&_.is-editor-empty]:before:text-[#5b6474]",
          "[&_.is-editor-empty]:before:pointer-events-none",
          "[&_.is-editor-empty]:before:float-left rtl:[&_.is-editor-empty]:before:float-right",
          "[&_.is-editor-empty]:before:h-0",
        ),
      },
      handlePaste: (_view, event) => {
        const files = event.clipboardData?.files;
        if (files && files.length > 0) {
          event.preventDefault();
          void handleFilesSelected(files);
          return true;
        }
        return false;
      },
      handleDrop: (_view, event) => {
        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
          event.preventDefault();
          void handleFilesSelected(files);
          return true;
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      const markdown =
        editor.storage.markdown?.getMarkdown?.() ?? editor.getText({ blockSeparator: "\n" });
      onContentChange(markdown);
    },
    onCreate: () => {
      setIsReady(true);
    },
  });

  useEffect(() => {
    if (!editor || !isReady) return;
    const current =
      editor.storage.markdown?.getMarkdown?.() ?? editor.getText({ blockSeparator: "\n" });
    if (current === content) return;
    if (editor.storage.markdown?.setMarkdown) {
      editor.storage.markdown.setMarkdown(content);
    } else {
      editor.commands.setContent(content);
    }
  }, [content, editor, isReady]);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const insertFileLink = (name: string, url: string) => {
    if (!editor) return;
    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "text",
          text: name,
          marks: [{ type: "link", attrs: { href: url } }],
        },
        { type: "text", text: "\n" },
      ])
      .run();
  };

  async function handleFilesSelected(files: FileList | null) {
    if (!files || files.length === 0 || !editor) return;
    setUploadState("uploading");
    try {
      for (const file of Array.from(files)) {
        const response = await createNoteUpload(noteId, {
          filename: file.name,
          contentType: file.type || "application/octet-stream",
          sizeBytes: file.size,
        });
        await fetch(response.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (file.type.startsWith("image/")) {
          editor.chain().focus().setImage({ src: response.publicUrl, alt: file.name }).run();
        } else {
          insertFileLink(file.name, response.publicUrl);
        }
      }
      setUploadState("idle");
    } catch {
      setUploadState("error");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div
      className="grid gap-0 overflow-hidden rounded-2xl border border-[rgba(15,23,42,0.1)] bg-white"
      dir={dir}
    >
      <div className="flex flex-wrap gap-2 border-b border-[rgba(15,23,42,0.1)] bg-[#f8fafc] px-4 py-3">
        <EditorToolbar
          editor={editor}
          onUploadClick={handleUploadClick}
          uploadLabel={uploadLabel}
          statusLabel={
            uploadState === "uploading"
              ? uploadingLabel
              : uploadState === "error"
                ? uploadFailedLabel
                : undefined
          }
        />
      </div>
      <div className="grid gap-3 p-[18px]">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(event) => {
            void handleFilesSelected(event.target.files);
          }}
        />
        <Input
          className="rounded-[10px] border border-[rgba(15,23,42,0.1)] text-[0.95rem]"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={titlePlaceholder}
          aria-label={titlePlaceholder}
        />
        <EditorContent editor={editor} aria-label={contentPlaceholder} />
      </div>
    </div>
  );
};

export default NoteEditor;
