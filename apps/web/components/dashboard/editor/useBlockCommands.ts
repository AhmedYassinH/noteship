import { useMemo, type MutableRefObject } from "react";
import type { Editor } from "@tiptap/react";
import {
  FileImage,
  FileText,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Minus,
  Paperclip,
  Quote,
  Video,
} from "lucide-react";
import type { EditorUiStrings } from "../../../data/note-editor";
import { applyDirectionToActiveTextBlock } from "./blockDirection";
import type { ArtifactType, BlockCommand, EditorDirection, UploadIntent } from "./editorTypes";

type UseBlockCommandsArgs = {
  commands: EditorUiStrings["commands"];
  editor: Editor | null;
  embedVideoFromLink: () => void;
  openUploadPicker: (intent: UploadIntent, artifactType: ArtifactType) => void;
  preferredBlockDirectionRef: MutableRefObject<EditorDirection>;
};

const ARABIC_KEYWORDS = {
  attachment: "\u0645\u0631\u0641\u0642",
  code: "\u0643\u0648\u062f",
  divider: "\u0641\u0627\u0635\u0644",
  document: "\u0645\u0633\u062a\u0646\u062f",
  heading: "\u0639\u0646\u0648\u0627\u0646",
  list: "\u0642\u0627\u0626\u0645\u0629",
  paragraph: "\u0641\u0642\u0631\u0629",
  quote: "\u0627\u0642\u062a\u0628\u0627\u0633",
  section: "\u0642\u0633\u0645",
  image: "\u0635\u0648\u0631\u0629",
  video: "\u0641\u064a\u062f\u064a\u0648",
};

export const useBlockCommands = ({
  commands,
  editor,
  embedVideoFromLink,
  openUploadPicker,
  preferredBlockDirectionRef,
}: UseBlockCommandsArgs): BlockCommand[] =>
  useMemo(
    () => [
      {
        id: "paragraph",
        label: commands.paragraph,
        keywords: ["text", "p", ARABIC_KEYWORDS.paragraph],
        icon: FileText,
        run: () => {
          if (!editor) return;
          editor.chain().focus().setParagraph().run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "h1",
        label: commands.heading1,
        keywords: ["title", "h1", ARABIC_KEYWORDS.heading],
        icon: Heading1,
        run: () => {
          if (!editor) return;
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "h2",
        label: commands.heading2,
        keywords: ["subtitle", "h2", ARABIC_KEYWORDS.heading],
        icon: Heading2,
        run: () => {
          if (!editor) return;
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "h3",
        label: commands.heading3,
        keywords: ["section", "h3", ARABIC_KEYWORDS.section],
        icon: Heading2,
        run: () => {
          if (!editor) return;
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "bullet",
        label: commands.bulletList,
        keywords: ["list", "ul", ARABIC_KEYWORDS.list],
        icon: List,
        run: () => editor?.chain().focus().toggleBulletList().run(),
      },
      {
        id: "ordered",
        label: commands.numberedList,
        keywords: ["list", "ol", ARABIC_KEYWORDS.list],
        icon: ListOrdered,
        run: () => editor?.chain().focus().toggleOrderedList().run(),
      },
      {
        id: "quote",
        label: commands.quote,
        keywords: ["blockquote", ARABIC_KEYWORDS.quote],
        icon: Quote,
        run: () => editor?.chain().focus().toggleBlockquote().run(),
      },
      {
        id: "code",
        label: commands.codeBlock,
        keywords: ["snippet", "code", ARABIC_KEYWORDS.code],
        icon: FileText,
        run: () => editor?.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: "divider",
        label: commands.divider,
        keywords: ["rule", "hr", ARABIC_KEYWORDS.divider],
        icon: Minus,
        run: () => editor?.chain().focus().setHorizontalRule().run(),
      },
      {
        id: "image-embed",
        label: commands.embedImage,
        keywords: ["image", "photo", ARABIC_KEYWORDS.image],
        icon: FileImage,
        run: () => openUploadPicker("embed", "image"),
      },
      {
        id: "image-attach",
        label: commands.attachImage,
        keywords: ["image", "attachment", ARABIC_KEYWORDS.image],
        icon: Paperclip,
        run: () => openUploadPicker("attach", "image"),
      },
      {
        id: "pdf-embed",
        label: commands.embedPdf,
        keywords: ["pdf", "document", ARABIC_KEYWORDS.document],
        icon: FileText,
        run: () => openUploadPicker("embed", "pdf"),
      },
      {
        id: "pdf-attach",
        label: commands.attachPdf,
        keywords: ["pdf", "attachment", ARABIC_KEYWORDS.attachment],
        icon: Paperclip,
        run: () => openUploadPicker("attach", "pdf"),
      },
      {
        id: "video-link",
        label: commands.embedVideoLink,
        keywords: ["video", "youtube", "vimeo", "loom", "drive", ARABIC_KEYWORDS.video],
        icon: Video,
        run: embedVideoFromLink,
      },
    ],
    [commands, editor, embedVideoFromLink, openUploadPicker, preferredBlockDirectionRef],
  );
