import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/Button";

type Props = {
  editor: Editor | null;
  onUploadClick?: () => void;
  uploadLabel?: string;
  statusLabel?: string;
};

const EditorToolbar = ({ editor, onUploadClick, uploadLabel, statusLabel }: Props) => {
  if (!editor) {
    return null;
  }

  const toolButtonClass = (active?: boolean) =>
    cn("rounded-md px-3", active && "bg-accent text-accent-foreground hover:bg-accent/80");

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={toolButtonClass(editor.isActive("heading", { level: 1 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-pressed={editor.isActive("heading", { level: 1 })}
        aria-label="H1"
      >
        H1
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={toolButtonClass(editor.isActive("heading", { level: 2 }))}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive("heading", { level: 2 })}
        aria-label="H2"
      >
        H2
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={toolButtonClass(editor.isActive("bold"))}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive("bold")}
        aria-label="B"
      >
        B
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={toolButtonClass(editor.isActive("italic"))}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive("italic")}
        aria-label="I"
      >
        I
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={toolButtonClass(editor.isActive("bulletList"))}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive("bulletList")}
        aria-label="UL"
      >
        UL
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={toolButtonClass(editor.isActive("blockquote"))}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-pressed={editor.isActive("blockquote")}
        aria-label="Q"
      >
        Q
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={toolButtonClass(editor.isActive("codeBlock"))}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-pressed={editor.isActive("codeBlock")}
        aria-label="Code"
      >
        {"</>"}
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-md px-3"
        onClick={onUploadClick}
        aria-label={uploadLabel}
      >
        {uploadLabel ?? "Upload"}
      </Button>
      {statusLabel ? (
        <span
          className="ml-auto text-xs text-[#5b6474] rtl:ml-0 rtl:mr-auto"
          role="status"
          aria-live="polite"
        >
          {statusLabel}
        </span>
      ) : null}
    </>
  );
};

export default EditorToolbar;
