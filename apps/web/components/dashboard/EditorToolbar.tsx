import type { Editor } from "@tiptap/react";
import styles from "../../app/dashboard/dashboard.module.css";

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

  return (
    <>
      <button
        type="button"
        className={`${styles.editorButton} ${
          editor.isActive("heading", { level: 1 }) ? styles.editorButtonActive : ""
        }`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        aria-pressed={editor.isActive("heading", { level: 1 })}
        aria-label="H1"
      >
        H1
      </button>
      <button
        type="button"
        className={`${styles.editorButton} ${
          editor.isActive("heading", { level: 2 }) ? styles.editorButtonActive : ""
        }`}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        aria-pressed={editor.isActive("heading", { level: 2 })}
        aria-label="H2"
      >
        H2
      </button>
      <button
        type="button"
        className={`${styles.editorButton} ${
          editor.isActive("bold") ? styles.editorButtonActive : ""
        }`}
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-pressed={editor.isActive("bold")}
        aria-label="B"
      >
        B
      </button>
      <button
        type="button"
        className={`${styles.editorButton} ${
          editor.isActive("italic") ? styles.editorButtonActive : ""
        }`}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-pressed={editor.isActive("italic")}
        aria-label="I"
      >
        I
      </button>
      <button
        type="button"
        className={`${styles.editorButton} ${
          editor.isActive("bulletList") ? styles.editorButtonActive : ""
        }`}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-pressed={editor.isActive("bulletList")}
        aria-label="UL"
      >
        UL
      </button>
      <button
        type="button"
        className={`${styles.editorButton} ${
          editor.isActive("blockquote") ? styles.editorButtonActive : ""
        }`}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        aria-pressed={editor.isActive("blockquote")}
        aria-label="Q"
      >
        Q
      </button>
      <button
        type="button"
        className={`${styles.editorButton} ${
          editor.isActive("codeBlock") ? styles.editorButtonActive : ""
        }`}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        aria-pressed={editor.isActive("codeBlock")}
        aria-label="Code"
      >
        {"</>"}
      </button>
      <button
        type="button"
        className={styles.editorButton}
        onClick={onUploadClick}
        aria-label={uploadLabel}
      >
        {uploadLabel ?? "Upload"}
      </button>
      {statusLabel ? (
        <span className={styles.editorStatus} role="status" aria-live="polite">
          {statusLabel}
        </span>
      ) : null}
    </>
  );
};

export default EditorToolbar;
