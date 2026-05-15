"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import { BubbleMenu, EditorContent, Extension, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import type { LucideIcon } from "lucide-react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowLeftToLine,
  ArrowRightToLine,
  ArrowUp,
  Bold as BoldIcon,
  Copy,
  Download,
  FileImage,
  FileInput,
  FileOutput,
  FileText,
  Heading1,
  Heading2,
  Italic as ItalicIcon,
  List,
  ListOrdered,
  Minus,
  GripVertical,
  Paperclip,
  Plus,
  Quote,
  Trash2,
  Video,
} from "lucide-react";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { createNoteUpload } from "../../lib/api/notes";
import { ApiError } from "../../lib/api/client";
import {
  AlignedHeading,
  AlignedParagraph,
  AttachmentBlockNode,
  PdfEmbedNode,
  RichImage,
  VideoEmbedNode,
  parseAlign,
  parseVideoEmbed,
  parseWidthPreset,
  toObsidianMarkdown,
  type BlockAlign,
  type WidthPreset,
} from "./editor/richNodes";
import { cn } from "@/lib/utils";
import type { Lang } from "../../data/dashboard";
import { editorUiCopy, type EditorUiStrings } from "../../data/note-editor";

type Direction = "ltr" | "rtl";
type UploadIntent = "embed" | "attach";
type ArtifactType = "image" | "pdf";

type Props = {
  lang: Lang;
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
  editorDirection: Direction;
};

type SlashRange = { from: number; to: number };
type BlockCommand = {
  id: string;
  label: string;
  keywords: string[];
  icon: LucideIcon;
  run: () => void | Promise<void>;
};

const MAX_IMPORT_BYTES = 500 * 1024;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_PDF_EMBED_BYTES = 1 * 1024 * 1024;
const MAX_PDF_ATTACHMENT_BYTES = 5 * 1024 * 1024;
const BLOCK_CONTROL_SIZE_PX = 28;
const BLOCK_CONTROL_OFFSET_PX = 65;
const DRAG_BLOCK_MIME = "application/x-noteship-block-index";

const getCurrentMarkdown = (editor: Editor): string =>
  editor.storage.markdown?.getMarkdown?.() ?? editor.getText({ blockSeparator: "\n" });

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const getBlockControlTop = (
  blockRect: DOMRect,
  shellRect: DOMRect,
  blockDom: HTMLElement,
): number => {
  const lineHeight = Number.parseFloat(window.getComputedStyle(blockDom).lineHeight);
  const safeLineHeight = Number.isFinite(lineHeight) ? lineHeight : 24;
  const rawTop =
    blockRect.top - shellRect.top + Math.max((safeLineHeight - BLOCK_CONTROL_SIZE_PX) / 2, 0);
  return clampNumber(rawTop, 8, Math.max(8, shellRect.height - BLOCK_CONTROL_SIZE_PX - 8));
};

const countWords = (value: string): number => {
  const words = value.trim().match(/\S+/g);
  return words ? words.length : 0;
};

const bytesForText = (value: string): number => new TextEncoder().encode(value).length;

const formatBytes = (
  bytes: number,
  labels: Pick<EditorUiStrings, "bytesLabel" | "kbLabel">,
): string => {
  if (bytes < 1024) {
    return `${bytes} ${labels.bytesLabel}`;
  }
  return `${(bytes / 1024).toFixed(1)} ${labels.kbLabel}`;
};

const triggerDownload = (filename: string, markdown: string): void => {
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const detectSlashCommand = (editor: Editor): { query: string; range: SlashRange } | null => {
  const selection = editor.state.selection;
  if (!selection.empty) return null;

  const parent = selection.$from.parent;
  if (parent.type.name !== "paragraph") return null;

  const prefix = parent.textContent.slice(0, selection.$from.parentOffset);
  const match = prefix.match(/(?:^|\s)\/([a-zA-Z0-9-]*)$/);
  if (!match) return null;

  const query = match[1] || "";
  return { query, range: { from: selection.from - query.length - 1, to: selection.from } };
};

type TopLevelBlockSelection = {
  index: number;
  pos: number;
  size: number;
};

const getTopLevelBlockFromPos = (editor: Editor, pos: number): TopLevelBlockSelection | null => {
  const boundedPos = Math.max(0, Math.min(pos, editor.state.doc.content.size));
  const $pos = editor.state.doc.resolve(boundedPos);
  if ($pos.depth < 1) return null;

  const index = $pos.index(0);
  if (index < 0 || index >= editor.state.doc.childCount) return null;
  const node = editor.state.doc.child(index);
  if (!node || !node.isBlock) return null;

  return {
    index,
    pos: $pos.before(1),
    size: node.nodeSize,
  };
};

const getTopLevelBlockSelection = (editor: Editor): TopLevelBlockSelection | null => {
  const { state } = editor;
  const $from = state.selection.$from;
  if ($from.depth < 1) return null;

  const index = $from.index(0);
  if (index < 0 || index >= state.doc.childCount) return null;

  const node = state.doc.child(index);
  if (!node || !node.isBlock) return null;

  return {
    index,
    pos: $from.before(1),
    size: node.nodeSize,
  };
};

const moveCurrentBlock = (editor: Editor, direction: "up" | "down"): boolean => {
  const block = getTopLevelBlockSelection(editor);
  if (!block) return false;

  const { state, view } = editor;
  const { doc } = state;
  if (direction === "up" && block.index === 0) return false;
  if (direction === "down" && block.index >= doc.childCount - 1) return false;

  const node = doc.child(block.index);
  if (!node) return false;

  const tr = state.tr;
  tr.delete(block.pos, block.pos + block.size);

  let insertPos = block.pos;
  if (direction === "up") {
    const previousNode = doc.child(block.index - 1);
    if (!previousNode) return false;
    insertPos = block.pos - previousNode.nodeSize;
  } else {
    const nextNode = doc.child(block.index + 1);
    if (!nextNode) return false;
    insertPos = block.pos + nextNode.nodeSize;
  }

  tr.insert(insertPos, node);
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus(Math.max(insertPos + 1, 1));
  return true;
};

const topLevelChildPos = (editor: Editor, index: number): number => {
  let pos = 0;
  for (let i = 0; i < index; i += 1) {
    pos += editor.state.doc.child(i).nodeSize;
  }
  return pos;
};

const moveBlockToIndex = (editor: Editor, fromIndex: number, toIndex: number): boolean => {
  const { state, view } = editor;
  const { doc } = state;
  if (fromIndex === toIndex) return false;
  if (fromIndex < 0 || fromIndex >= doc.childCount) return false;
  if (toIndex < 0 || toIndex >= doc.childCount) return false;

  const node = doc.child(fromIndex);
  if (!node) return false;

  const fromPos = topLevelChildPos(editor, fromIndex);
  const tr = state.tr;
  tr.delete(fromPos, fromPos + node.nodeSize);

  const targetIndex = toIndex > fromIndex ? toIndex - 1 : toIndex;
  const boundedTarget = Math.max(0, Math.min(targetIndex, tr.doc.childCount));

  let insertPos = tr.doc.content.size;
  if (boundedTarget < tr.doc.childCount) {
    insertPos = 0;
    for (let i = 0; i < boundedTarget; i += 1) {
      insertPos += tr.doc.child(i).nodeSize;
    }
  }

  tr.insert(insertPos, node);
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus(Math.max(insertPos + 1, 1));
  return true;
};

const duplicateCurrentBlock = (editor: Editor): boolean => {
  const block = getTopLevelBlockSelection(editor);
  if (!block) return false;

  const { state, view } = editor;
  const node = state.doc.child(block.index);
  if (!node) return false;

  const tr = state.tr;
  tr.insert(block.pos + block.size, node.type.create(node.attrs, node.content, node.marks));
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus(block.pos + block.size + 1);
  return true;
};

const deleteCurrentBlock = (editor: Editor): boolean => {
  const block = getTopLevelBlockSelection(editor);
  if (!block) return false;

  const { state, view } = editor;
  const tr = state.tr;
  tr.delete(block.pos, block.pos + block.size);
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus(Math.max(1, Math.min(block.pos, tr.doc.content.size)));
  return true;
};

const selectCurrentBlock = (editor: Editor): boolean => {
  const block = getTopLevelBlockSelection(editor);
  if (!block) return false;

  const { state } = editor;
  const node = state.doc.nodeAt(block.pos);
  if (!node || node.type.spec.selectable === false) {
    return false;
  }

  return editor.chain().focus().setNodeSelection(block.pos).run();
};

const selectBlockByPos = (editor: Editor, pos: number): boolean =>
  editor.chain().focus().setNodeSelection(pos).run();

const parseBlockDirection = (value: unknown): Direction | null => {
  if (value === "ltr" || value === "rtl") {
    return value;
  }
  return null;
};

const getActiveTextBlockDirection = (editor: Editor): Direction | null => {
  if (editor.isActive("heading")) {
    return parseBlockDirection(editor.getAttributes("heading").dir);
  }
  if (editor.isActive("paragraph")) {
    return parseBlockDirection(editor.getAttributes("paragraph").dir);
  }
  return null;
};

const applyDirectionToActiveTextBlock = (editor: Editor, direction: Direction): boolean => {
  if (editor.isActive("heading")) {
    return editor.chain().focus().updateAttributes("heading", { dir: direction }).run();
  }
  if (editor.isActive("paragraph")) {
    return editor.chain().focus().updateAttributes("paragraph", { dir: direction }).run();
  }
  return false;
};

const NoteEditor = ({
  lang,
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
  editorDirection,
}: Props) => {
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const markdownInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentMarkdown, setCurrentMarkdown] = useState(content);
  const [wordCount, setWordCount] = useState(0);
  const [pendingUpload, setPendingUpload] = useState<{
    intent: UploadIntent;
    artifactType: ArtifactType;
  } | null>(null);
  const [fileAccept, setFileAccept] = useState("image/*,application/pdf");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMode, setMenuMode] = useState<"insert" | "slash">("insert");
  const [menuQuery, setMenuQuery] = useState("");
  const [slashRange, setSlashRange] = useState<SlashRange | null>(null);
  const [insertAnchorBlock, setInsertAnchorBlock] = useState<TopLevelBlockSelection | null>(null);
  const [menuTop, setMenuTop] = useState(52);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [hoverBlock, setHoverBlock] = useState<TopLevelBlockSelection | null>(null);
  const [pinnedBlock, setPinnedBlock] = useState<TopLevelBlockSelection | null>(null);
  const [notePreferredBlockDirection, setNotePreferredBlockDirection] =
    useState<Direction>(editorDirection);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSheetBlock, setMobileSheetBlock] = useState<TopLevelBlockSelection | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [draggingBlock, setDraggingBlock] = useState<TopLevelBlockSelection | null>(null);
  const draggingBlockRef = useRef<TopLevelBlockSelection | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const menuModeRef = useRef<"insert" | "slash">("insert");
  const hoverIndexRef = useRef<number | null>(null);
  const typingResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPinnedBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preferredBlockDirectionRef = useRef<Direction>(editorDirection);
  const ui = useMemo(() => editorUiCopy[lang], [lang]);
  const uiRef = useRef(ui);

  useEffect(() => {
    menuModeRef.current = menuMode;
  }, [menuMode]);

  useEffect(() => {
    uiRef.current = ui;
  }, [ui]);

  useEffect(() => {
    setNotePreferredBlockDirection(editorDirection);
  }, [editorDirection]);

  useEffect(() => {
    preferredBlockDirectionRef.current = notePreferredBlockDirection;
  }, [notePreferredBlockDirection]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(pointer: coarse)");
    const update = () => setIsCoarsePointer(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(
    () => () => {
      if (typingResetTimerRef.current) {
        clearTimeout(typingResetTimerRef.current);
      }
      if (clearPinnedBlockTimerRef.current) {
        clearTimeout(clearPinnedBlockTimerRef.current);
      }
      editorInstanceRef.current = null;
    },
    [],
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, paragraph: false, codeBlock: {} }),
      AlignedParagraph,
      AlignedHeading.configure({ levels: [1, 2, 3] }),
      RichImage.configure({ inline: false }),
      Link.configure({ openOnClick: false }),
      Placeholder.configure({
        placeholder: () => uiRef.current.hintWriteSlash,
        showOnlyCurrent: true,
        includeChildren: false,
        emptyNodeClass: "is-empty",
      }),
      PdfEmbedNode,
      VideoEmbedNode,
      AttachmentBlockNode,
      Markdown.configure({ html: true }),
      Extension.create({
        name: "commandMenuEscape",
        addKeyboardShortcuts() {
          return {
            Escape: () => {
              setMenuOpen(false);
              return false;
            },
          };
        },
      }),
    ],
    content,
    editorProps: {
      attributes: {
        class: cn(
          "h-full min-h-[460px] max-h-full overflow-y-auto rounded-[18px] border border-[rgba(15,23,42,0.12)] bg-[radial-gradient(circle_at_top,#ffffff_0%,#f8fafc_75%)] px-5 py-6 text-[1rem] leading-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]",
          "focus:outline-none",
          "[&_h1]:text-[1.6rem] [&_h1]:leading-[1.2] [&_h2]:text-[1.35rem] [&_h2]:leading-[1.25] [&_h3]:text-[1.2rem] [&_h3]:leading-[1.3]",
          "[&_blockquote]:border-s-4 [&_blockquote]:border-[rgba(15,118,110,0.35)] [&_blockquote]:ps-3 [&_blockquote]:text-[#5b6474]",
          "[&_.is-empty]:before:content-[attr(data-placeholder)]",
          "[&_.is-empty]:before:text-[#94a3b8]",
          "[&_.is-empty]:before:pointer-events-none",
          "[&_.is-empty]:before:float-left rtl:[&_.is-empty]:before:float-right",
          "[&_.is-empty]:before:h-0",
          "[&_a]:[unicode-bidi:isolate] [&_code]:[direction:ltr] [&_code]:[unicode-bidi:isolate]",
        ),
      },
      handleDOMEvents: {
        dragover: (_view, event) => {
          const dragEvent = event as DragEvent;
          const hasCustomDragType = Array.from(dragEvent.dataTransfer?.types ?? []).includes(
            DRAG_BLOCK_MIME,
          );
          if (!draggingBlockRef.current && !hasCustomDragType) return false;
          dragEvent.preventDefault();
          if (dragEvent.dataTransfer) {
            dragEvent.dataTransfer.dropEffect = "move";
          }
          return true;
        },
        drop: (view, event) => {
          const dragEvent = event as DragEvent;
          const hasCustomDragType = Array.from(dragEvent.dataTransfer?.types ?? []).includes(
            DRAG_BLOCK_MIME,
          );
          if (!draggingBlockRef.current && !hasCustomDragType) return false;

          dragEvent.preventDefault();
          const draggedFromTransfer = dragEvent.dataTransfer?.getData(DRAG_BLOCK_MIME) ?? "";
          const sourceIndexFromTransfer = Number.parseInt(draggedFromTransfer, 10);
          const sourceIndex = Number.isFinite(sourceIndexFromTransfer)
            ? sourceIndexFromTransfer
            : (draggingBlockRef.current?.index ?? -1);

          if (sourceIndex < 0) {
            draggingBlockRef.current = null;
            setDraggingBlock(null);
            return true;
          }

          const coords = view.posAtCoords({ left: dragEvent.clientX, top: dragEvent.clientY });
          const activeEditor = editorInstanceRef.current;
          const targetBlock =
            coords && activeEditor ? getTopLevelBlockFromPos(activeEditor, coords.pos) : null;
          if (targetBlock && activeEditor) {
            const moved = moveBlockToIndex(activeEditor, sourceIndex, targetBlock.index);
            if (moved) {
              setStatusMessage(ui.blockReordered);
            }
          }

          draggingBlockRef.current = null;
          setDraggingBlock(null);
          return true;
        },
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      const markdown = getCurrentMarkdown(currentEditor);
      setCurrentMarkdown(markdown);
      setWordCount(countWords(currentEditor.getText({ blockSeparator: " " })));
      onContentChange(markdown);

      const slash = detectSlashCommand(currentEditor);
      if (slash) {
        setMenuOpen(true);
        setMenuMode("slash");
        setMenuQuery(slash.query);
        setSlashRange(slash.range);
        setInsertAnchorBlock(null);
        const shellRect = editorShellRef.current?.getBoundingClientRect();
        const slashCoords = currentEditor.view.coordsAtPos(slash.range.from);
        if (shellRect) {
          setMenuTop(Math.max(48, slashCoords.bottom - shellRect.top + 8));
        }
      } else {
        setSlashRange(null);
        if (menuModeRef.current === "slash") {
          setMenuOpen(false);
          setMenuQuery("");
          setMenuMode("insert");
        }
      }
    },
    onCreate: ({ editor: currentEditor }) => {
      editorInstanceRef.current = currentEditor;
      setIsReady(true);
      setCurrentMarkdown(getCurrentMarkdown(currentEditor));
      setWordCount(countWords(currentEditor.getText({ blockSeparator: " " })));
    },
    onSelectionUpdate: () => {
      setSelectionVersion((value) => value + 1);
    },
  });

  useEffect(() => {
    if (!editor || !isReady) return;
    const current = getCurrentMarkdown(editor);
    if (current === content) return;
    if (editor.storage.markdown?.setMarkdown) {
      editor.storage.markdown.setMarkdown(content);
    } else {
      editor.commands.setContent(content);
    }
    setCurrentMarkdown(content);
  }, [content, editor, isReady]);

  useEffect(() => {
    if (!editor) return;
    // Refresh placeholder decorations when language changes.
    editor.view.dispatch(editor.state.tr);
  }, [editor, lang]);

  useEffect(() => {
    if (!editor) return;
    const shell = editorShellRef.current;
    if (!shell) return;

    const handlePointerMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-editor-block-controls='true']")) {
        return;
      }
      const coords = editor.view.posAtCoords({ left: event.clientX, top: event.clientY });
      if (!coords) {
        hoverIndexRef.current = null;
        setHoverBlock(null);
        return;
      }
      const block = getTopLevelBlockFromPos(editor, coords.pos);
      if (!block) {
        hoverIndexRef.current = null;
        setHoverBlock(null);
        return;
      }
      if (hoverIndexRef.current !== block.index) {
        hoverIndexRef.current = block.index;
        setHoverBlock(block);
      }
    };

    const handleLeave = () => {
      hoverIndexRef.current = null;
      setHoverBlock(null);
    };

    shell.addEventListener("mousemove", handlePointerMove);
    shell.addEventListener("mouseleave", handleLeave);

    return () => {
      shell.removeEventListener("mousemove", handlePointerMove);
      shell.removeEventListener("mouseleave", handleLeave);
    };
  }, [editor]);

  useEffect(() => {
    if (!editor) return;
    const root = editor.view.dom as HTMLElement;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const isTypingKey =
        event.key.length === 1 ||
        event.key === "Backspace" ||
        event.key === "Delete" ||
        event.key === "Enter" ||
        event.key === "Tab";
      if (!isTypingKey) return;
      setIsTyping(true);
      if (typingResetTimerRef.current) {
        clearTimeout(typingResetTimerRef.current);
      }
      typingResetTimerRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 700);
      if (event.key === "Enter" && !event.shiftKey) {
        setTimeout(() => {
          const activeEditor = editorInstanceRef.current;
          if (!activeEditor) return;
          applyDirectionToActiveTextBlock(activeEditor, preferredBlockDirectionRef.current);
        }, 0);
      }
    };

    const handleBlur = () => {
      if (typingResetTimerRef.current) {
        clearTimeout(typingResetTimerRef.current);
      }
      setIsTyping(false);
    };

    root.addEventListener("keydown", handleKeyDown);
    root.addEventListener("blur", handleBlur);

    return () => {
      root.removeEventListener("keydown", handleKeyDown);
      root.removeEventListener("blur", handleBlur);
    };
  }, [editor]);

  const openUploadPicker = useCallback((intent: UploadIntent, artifactType: ArtifactType) => {
    setPendingUpload({ intent, artifactType });
    setFileAccept(artifactType === "image" ? "image/*" : "application/pdf");
    fileInputRef.current?.click();
  }, []);

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

  const handleUploadFile = useCallback(
    async (file: File | null, intent: UploadIntent, artifactType: ArtifactType) => {
      if (!file || !editor) return;
      if (file.type.startsWith("video/")) {
        setUploadState("error");
        setStatusMessage(ui.videoUploadsUnsupported);
        return;
      }
      if (artifactType === "image" && !file.type.startsWith("image/")) {
        setUploadState("error");
        setStatusMessage(ui.selectImageFile);
        return;
      }
      if (artifactType === "pdf" && file.type !== "application/pdf") {
        setUploadState("error");
        setStatusMessage(ui.selectPdfFile);
        return;
      }
      if (artifactType === "image" && file.size > MAX_IMAGE_BYTES) {
        setUploadState("error");
        setStatusMessage(ui.imageUploadLimit);
        return;
      }
      if (artifactType === "pdf" && intent === "embed" && file.size > MAX_PDF_EMBED_BYTES) {
        setUploadState("error");
        setStatusMessage(ui.embeddedPdfLimit);
        return;
      }
      if (artifactType === "pdf" && intent === "attach" && file.size > MAX_PDF_ATTACHMENT_BYTES) {
        setUploadState("error");
        setStatusMessage(ui.attachedPdfLimit);
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
        await fetch(response.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });

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
    [editor, insertAttachment, noteId, ui, uploadFailedLabel],
  );

  const handleEmbedVideoFromLink = useCallback(() => {
    if (!editor) return;
    const link = window.prompt(ui.pasteVideoUrlPrompt);
    if (!link) return;
    const parsed = parseVideoEmbed(link.trim());
    if (!parsed) {
      setStatusMessage(ui.unsupportedVideoProvider);
      return;
    }
    editor
      .chain()
      .focus()
      .insertContent({
        type: "videoEmbed",
        attrs: {
          url: parsed.canonicalUrl,
          embedSrc: parsed.embedSrc,
          provider: parsed.provider,
          widthPreset: "medium",
          align: "start",
        },
      })
      .run();
  }, [editor, ui.pasteVideoUrlPrompt, ui.unsupportedVideoProvider]);

  const applyBlockDirection = useCallback(
    (direction: Direction) => {
      if (!editor) return;
      const applied = applyDirectionToActiveTextBlock(editor, direction);
      if (applied) {
        setNotePreferredBlockDirection(direction);
      }
    },
    [editor],
  );

  const applyAlignment = useCallback(
    (align: BlockAlign) => {
      if (!editor) return;
      const types = ["pdfEmbed", "videoEmbed", "attachmentBlock", "image", "heading", "paragraph"];
      for (const type of types) {
        if (editor.isActive(type)) {
          editor.chain().focus().updateAttributes(type, { align }).run();
          return;
        }
      }
      editor.chain().focus().updateAttributes("paragraph", { align }).run();
    },
    [editor],
  );

  const applyMediaWidth = useCallback(
    (widthPreset: WidthPreset) => {
      if (!editor) return;
      if (editor.isActive("image"))
        return void editor.chain().focus().updateAttributes("image", { widthPreset }).run();
      if (editor.isActive("pdfEmbed"))
        return void editor.chain().focus().updateAttributes("pdfEmbed", { widthPreset }).run();
      if (editor.isActive("videoEmbed"))
        return void editor.chain().focus().updateAttributes("videoEmbed", { widthPreset }).run();
    },
    [editor],
  );

  const blockCommands = useMemo<BlockCommand[]>(
    () => [
      {
        id: "paragraph",
        label: ui.commands.paragraph,
        keywords: ["text", "p", "فقرة"],
        icon: FileText,
        run: () => {
          if (!editor) return;
          editor.chain().focus().setParagraph().run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "h1",
        label: ui.commands.heading1,
        keywords: ["title", "h1", "عنوان"],
        icon: Heading1,
        run: () => {
          if (!editor) return;
          editor.chain().focus().toggleHeading({ level: 1 }).run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "h2",
        label: ui.commands.heading2,
        keywords: ["subtitle", "h2", "عنوان"],
        icon: Heading2,
        run: () => {
          if (!editor) return;
          editor.chain().focus().toggleHeading({ level: 2 }).run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "h3",
        label: ui.commands.heading3,
        keywords: ["section", "h3", "قسم"],
        icon: Heading2,
        run: () => {
          if (!editor) return;
          editor.chain().focus().toggleHeading({ level: 3 }).run();
          applyDirectionToActiveTextBlock(editor, preferredBlockDirectionRef.current);
        },
      },
      {
        id: "bullet",
        label: ui.commands.bulletList,
        keywords: ["list", "ul", "قائمة"],
        icon: List,
        run: () => editor?.chain().focus().toggleBulletList().run(),
      },
      {
        id: "ordered",
        label: ui.commands.numberedList,
        keywords: ["list", "ol", "قائمة"],
        icon: ListOrdered,
        run: () => editor?.chain().focus().toggleOrderedList().run(),
      },
      {
        id: "quote",
        label: ui.commands.quote,
        keywords: ["blockquote", "اقتباس"],
        icon: Quote,
        run: () => editor?.chain().focus().toggleBlockquote().run(),
      },
      {
        id: "code",
        label: ui.commands.codeBlock,
        keywords: ["snippet", "code", "كود"],
        icon: FileText,
        run: () => editor?.chain().focus().toggleCodeBlock().run(),
      },
      {
        id: "divider",
        label: ui.commands.divider,
        keywords: ["rule", "hr", "فاصل"],
        icon: Minus,
        run: () => editor?.chain().focus().setHorizontalRule().run(),
      },
      {
        id: "image-embed",
        label: ui.commands.embedImage,
        keywords: ["image", "photo", "صورة"],
        icon: FileImage,
        run: () => openUploadPicker("embed", "image"),
      },
      {
        id: "image-attach",
        label: ui.commands.attachImage,
        keywords: ["image", "attachment", "صورة"],
        icon: Paperclip,
        run: () => openUploadPicker("attach", "image"),
      },
      {
        id: "pdf-embed",
        label: ui.commands.embedPdf,
        keywords: ["pdf", "document", "مستند"],
        icon: FileText,
        run: () => openUploadPicker("embed", "pdf"),
      },
      {
        id: "pdf-attach",
        label: ui.commands.attachPdf,
        keywords: ["pdf", "attachment", "مرفق"],
        icon: Paperclip,
        run: () => openUploadPicker("attach", "pdf"),
      },
      {
        id: "video-link",
        label: ui.commands.embedVideoLink,
        keywords: ["video", "youtube", "vimeo", "loom", "drive", "فيديو"],
        icon: Video,
        run: handleEmbedVideoFromLink,
      },
    ],
    [editor, handleEmbedVideoFromLink, openUploadPicker, ui.commands],
  );

  const filteredCommands = useMemo(() => {
    const query = menuQuery.trim().toLowerCase();
    if (!query) return blockCommands;
    return blockCommands.filter(
      (command) =>
        command.label.toLowerCase().includes(query) ||
        command.keywords.some((keyword) => keyword.includes(query)),
    );
  }, [blockCommands, menuQuery]);

  const closeCommandMenu = useCallback(() => {
    if (clearPinnedBlockTimerRef.current) {
      clearTimeout(clearPinnedBlockTimerRef.current);
      clearPinnedBlockTimerRef.current = null;
    }
    setMenuOpen(false);
    setMenuMode("insert");
    setMenuQuery("");
    setSlashRange(null);
    setInsertAnchorBlock(null);
    setPinnedBlock(null);
  }, []);

  const pinBlockControls = useCallback((block: TopLevelBlockSelection | null) => {
    if (!block) return;
    if (clearPinnedBlockTimerRef.current) {
      clearTimeout(clearPinnedBlockTimerRef.current);
      clearPinnedBlockTimerRef.current = null;
    }
    setPinnedBlock(block);
  }, []);

  const schedulePinnedBlockClear = useCallback(() => {
    if (menuOpen) return;
    if (clearPinnedBlockTimerRef.current) {
      clearTimeout(clearPinnedBlockTimerRef.current);
    }
    clearPinnedBlockTimerRef.current = setTimeout(() => {
      setPinnedBlock(null);
      clearPinnedBlockTimerRef.current = null;
    }, 150);
  }, [menuOpen]);

  const createInsertTargetBelowAnchor = useCallback(() => {
    if (!editor || !insertAnchorBlock) return false;
    const { doc } = editor.state;
    if (doc.childCount === 0) return false;

    const anchorIndex = Math.max(0, Math.min(insertAnchorBlock.index, doc.childCount - 1));
    const anchorNode = doc.child(anchorIndex);
    const paragraphType = editor.state.schema.nodes.paragraph;
    if (!anchorNode || !paragraphType) return false;

    const insertPos = topLevelChildPos(editor, anchorIndex) + anchorNode.nodeSize;
    const tr = editor.state.tr.insert(
      insertPos,
      paragraphType.create({ dir: preferredBlockDirectionRef.current }),
    );
    editor.view.dispatch(tr.scrollIntoView());
    editor.commands.focus(Math.max(1, Math.min(insertPos + 1, tr.doc.content.size)));
    return true;
  }, [editor, insertAnchorBlock]);

  const runBlockCommand = useCallback(
    async (command: BlockCommand) => {
      if (!editor) return;
      if (menuMode === "slash" && slashRange) {
        editor.chain().focus().deleteRange(slashRange).run();
      }
      if (menuMode === "insert") {
        createInsertTargetBelowAnchor();
      }
      closeCommandMenu();
      await command.run();
    },
    [closeCommandMenu, createInsertTargetBelowAnchor, editor, menuMode, slashRange],
  );

  const openInsertMenuAt = useCallback(
    (top: number, anchor: TopLevelBlockSelection | null) => {
      setMenuMode("insert");
      setMenuQuery("");
      setSlashRange(null);
      setInsertAnchorBlock(anchor);
      pinBlockControls(anchor);
      setMenuTop(Math.max(48, top));
      setMenuOpen(true);
    },
    [pinBlockControls],
  );

  const activeAlign = useMemo<BlockAlign>(() => {
    if (!editor) return "start";
    const types = ["pdfEmbed", "videoEmbed", "attachmentBlock", "image", "heading", "paragraph"];
    for (const type of types) {
      if (editor.isActive(type)) return parseAlign(editor.getAttributes(type).align);
    }
    return "start";
  }, [editor]);
  const activeBlockDirection = useMemo<Direction>(() => {
    // Recompute on cursor moves so the popover reflects the active block direction.
    if (selectionVersion < 0) {
      return notePreferredBlockDirection;
    }
    if (!editor) return notePreferredBlockDirection;
    return getActiveTextBlockDirection(editor) ?? notePreferredBlockDirection;
  }, [editor, notePreferredBlockDirection, selectionVersion]);
  const activePhysicalAlign = useMemo<"left" | "center" | "right">(() => {
    if (activeAlign === "left" || activeAlign === "center" || activeAlign === "right") {
      return activeAlign;
    }
    if (activeAlign === "start") {
      return editorDirection === "rtl" ? "right" : "left";
    }
    return editorDirection === "rtl" ? "left" : "right";
  }, [activeAlign, editorDirection]);

  const activeMediaWidth = useMemo<WidthPreset>(() => {
    if (!editor) return "medium";
    if (editor.isActive("image"))
      return parseWidthPreset(editor.getAttributes("image").widthPreset);
    if (editor.isActive("pdfEmbed"))
      return parseWidthPreset(editor.getAttributes("pdfEmbed").widthPreset);
    if (editor.isActive("videoEmbed"))
      return parseWidthPreset(editor.getAttributes("videoEmbed").widthPreset);
    return "medium";
  }, [editor]);

  const currentBlock = selectionVersion >= 0 && editor ? getTopLevelBlockSelection(editor) : null;

  useEffect(() => {
    if (!editor) return;
    const blockDirection = getActiveTextBlockDirection(editor);
    if (blockDirection) {
      setNotePreferredBlockDirection(blockDirection);
    }
  }, [editor, selectionVersion]);

  const canMoveUp = !!currentBlock && currentBlock.index > 0;
  const canMoveDown =
    !!currentBlock && !!editor && currentBlock.index < editor.state.doc.childCount - 1;

  const handleMoveBlockUp = useCallback(() => {
    if (!editor) return;
    moveCurrentBlock(editor, "up");
  }, [editor]);

  const handleMoveBlockDown = useCallback(() => {
    if (!editor) return;
    moveCurrentBlock(editor, "down");
  }, [editor]);

  const handleDuplicateBlock = useCallback(() => {
    if (!editor) return;
    duplicateCurrentBlock(editor);
  }, [editor]);

  const handleDeleteBlock = useCallback(() => {
    if (!editor) return;
    deleteCurrentBlock(editor);
  }, [editor]);

  const withMobileBlockSelection = useCallback(
    (action: (instance: Editor) => void) => {
      if (!editor || !mobileSheetBlock) return;
      if (!selectBlockByPos(editor, mobileSheetBlock.pos)) return;
      action(editor);
      setMobileSheetOpen(false);
    },
    [editor, mobileSheetBlock],
  );

  const handleDragHandle = useCallback(() => {
    if (!editor) return;
    const targetBlock = hoverBlock ?? getTopLevelBlockSelection(editor);
    if (isCoarsePointer) {
      if (!targetBlock) return;
      setMobileSheetBlock(targetBlock);
      setMobileSheetOpen(true);
      return;
    }
    pinBlockControls(targetBlock);
    const selected = selectCurrentBlock(editor);
    if (selected) {
      setStatusMessage(ui.blockSelectedForDrag);
    }
  }, [editor, hoverBlock, isCoarsePointer, pinBlockControls, ui.blockSelectedForDrag]);

  const handleGripDragStart = useCallback(
    (event: ReactDragEvent<HTMLButtonElement>) => {
      if (isCoarsePointer || !editor) {
        event.preventDefault();
        return;
      }
      const targetBlock = hoverBlock ?? getTopLevelBlockSelection(editor);
      if (!targetBlock) {
        event.preventDefault();
        return;
      }
      if (!selectBlockByPos(editor, targetBlock.pos)) {
        event.preventDefault();
        return;
      }
      pinBlockControls(targetBlock);
      draggingBlockRef.current = targetBlock;
      setDraggingBlock(targetBlock);
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(DRAG_BLOCK_MIME, String(targetBlock.index));
      event.dataTransfer.setData("text/plain", "");
    },
    [editor, hoverBlock, isCoarsePointer, pinBlockControls],
  );

  const handleGripDragEnd = useCallback(() => {
    draggingBlockRef.current = null;
    setDraggingBlock(null);
  }, []);

  const handleEditorMouseDownCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!menuOpen) return;
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (target.closest("[data-testid='editor-command-menu']")) return;
      if (target.closest("[data-testid='editor-side-add-block']")) return;
      if (!target.closest(".ProseMirror")) return;
      closeCommandMenu();
    },
    [closeCommandMenu, menuOpen],
  );

  const visibleBlock = isCoarsePointer
    ? currentBlock
    : ((menuOpen ? insertAnchorBlock : null) ?? pinnedBlock ?? hoverBlock ?? currentBlock);
  const blockControlsVisible = !!visibleBlock;
  const handleBlockControlsMouseEnter = useCallback(() => {
    const targetBlock = visibleBlock ?? currentBlock;
    pinBlockControls(targetBlock);
  }, [currentBlock, pinBlockControls, visibleBlock]);
  const handleBlockControlsMouseLeave = useCallback(() => {
    schedulePinnedBlockClear();
  }, [schedulePinnedBlockClear]);
  const blockControlsTop = useMemo(() => {
    if (!editor || !visibleBlock) return 14;
    const blockDom = editor.view.nodeDOM(visibleBlock.pos) as HTMLElement | null;
    const shellRect = editorShellRef.current?.getBoundingClientRect();
    if (!blockDom || !shellRect) return 14;
    const blockRect = blockDom.getBoundingClientRect();
    return getBlockControlTop(blockRect, shellRect, blockDom);
  }, [editor, visibleBlock]);

  return (
    <div className="relative flex h-full min-h-0 flex-col gap-0 overflow-visible rounded-2xl border border-[rgba(15,23,42,0.12)] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
      <div className="flex flex-wrap items-center gap-2 border-b border-[rgba(15,23,42,0.1)] bg-[linear-gradient(180deg,#fbfdff_0%,#f5f8fc_100%)] px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg px-3"
          onClick={() => markdownInputRef.current?.click()}
          data-testid="editor-toolbar-import-md"
        >
          <FileInput className="h-4 w-4" />
          {ui.importMd}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg px-3"
          onClick={() => triggerDownload(`note-${noteId}.md`, currentMarkdown)}
          data-testid="editor-toolbar-export-rich"
        >
          <Download className="h-4 w-4" />
          {ui.exportMd}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-lg px-3"
          onClick={() =>
            triggerDownload(`note-${noteId}-obsidian.md`, toObsidianMarkdown(currentMarkdown))
          }
          data-testid="editor-toolbar-export-obsidian"
        >
          <FileOutput className="h-4 w-4" />
          {ui.exportObsidian}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-[18px]">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={fileAccept}
          onChange={(event) => {
            const file = event.target.files?.[0] || null;
            if (pendingUpload)
              void handleUploadFile(file, pendingUpload.intent, pendingUpload.artifactType);
            setPendingUpload(null);
          }}
        />
        <input
          ref={markdownInputRef}
          type="file"
          accept=".md,text/markdown"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0] || null;
            if (!file || !editor) return;
            if (file.size > MAX_IMPORT_BYTES) {
              setStatusMessage(ui.markdownImportLimit);
              return;
            }
            const text = await file.text();
            if (editor.storage.markdown?.setMarkdown) editor.storage.markdown.setMarkdown(text);
            else editor.commands.setContent(text);
            setStatusMessage(ui.markdownImported);
            event.currentTarget.value = "";
          }}
        />
        <Input
          className="rounded-[12px] border border-[rgba(15,23,42,0.12)] bg-white text-[0.96rem]"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
          placeholder={titlePlaceholder}
          aria-label={titlePlaceholder}
        />

        <div
          ref={editorShellRef}
          className="relative min-h-0 flex-1 overflow-visible"
          onMouseDownCapture={handleEditorMouseDownCapture}
        >
          {editor ? (
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 120, placement: "top" }}
              shouldShow={({ editor: bubbleEditor }) => {
                if (!bubbleEditor.isFocused || menuOpen || isCoarsePointer || isTyping)
                  return false;
                const selection = bubbleEditor.state.selection;
                if (!selection.empty) return true;
                return selection.$from.parent.textContent.trim().length === 0;
              }}
              className="flex flex-wrap items-center gap-1 rounded-xl border border-[rgba(15,23,42,0.14)] bg-white p-1 shadow-[0_14px_35px_rgba(15,23,42,0.16)]"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-2 text-xs",
                  editor?.isActive("bold") && "bg-accent",
                )}
                onClick={() => editor?.chain().focus().toggleBold().run()}
                data-testid="editor-toolbar-bold"
              >
                <BoldIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-2 text-xs",
                  editor?.isActive("italic") && "bg-accent",
                )}
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                data-testid="editor-toolbar-italic"
              >
                <ItalicIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-2 text-xs",
                  activeBlockDirection === "ltr" && "bg-accent",
                )}
                onClick={() => applyBlockDirection("ltr")}
                data-testid="editor-dir-ltr"
                title={ui.setLtr}
              >
                <ArrowLeftToLine className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-2 text-xs",
                  activeBlockDirection === "rtl" && "bg-accent",
                )}
                onClick={() => applyBlockDirection("rtl")}
                data-testid="editor-dir-rtl"
                title={ui.setRtl}
              >
                <ArrowRightToLine className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-2 text-xs",
                  activePhysicalAlign === "left" && "bg-accent",
                )}
                onClick={() => applyAlignment("left")}
                data-testid="editor-align-left"
                title={ui.alignLeft}
              >
                <AlignLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-2 text-xs",
                  activePhysicalAlign === "center" && "bg-accent",
                )}
                onClick={() => applyAlignment("center")}
                data-testid="editor-align-center"
                title={ui.alignCenter}
              >
                <AlignCenter className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-7 rounded-md px-2 text-xs",
                  activePhysicalAlign === "right" && "bg-accent",
                )}
                onClick={() => applyAlignment("right")}
                data-testid="editor-align-right"
                title={ui.alignRight}
              >
                <AlignRight className="h-3.5 w-3.5" />
              </Button>
            </BubbleMenu>
          ) : null}
          {blockControlsVisible ? (
            <div
              data-editor-block-controls="true"
              className="absolute z-20 flex items-center gap-1"
              onMouseEnter={handleBlockControlsMouseEnter}
              onMouseLeave={handleBlockControlsMouseLeave}
              style={{
                top: `${blockControlsTop}px`,
                insetInlineStart: `-${BLOCK_CONTROL_OFFSET_PX}px`,
              }}
            >
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-[rgba(15,23,42,0.14)] bg-white shadow-sm [&_svg]:h-3.5 [&_svg]:w-3.5"
                onClick={() =>
                  openInsertMenuAt(
                    blockControlsTop + BLOCK_CONTROL_SIZE_PX + 8,
                    visibleBlock ?? currentBlock,
                  )
                }
                data-testid="editor-side-add-block"
              >
                <Plus />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 cursor-grab rounded-full border-[rgba(15,23,42,0.14)] bg-white shadow-sm active:cursor-grabbing [&_svg]:h-3.5 [&_svg]:w-3.5"
                onClick={handleDragHandle}
                draggable={!isCoarsePointer}
                onDragStart={handleGripDragStart}
                onDragEnd={handleGripDragEnd}
                data-testid="editor-block-drag-handle"
                title={isCoarsePointer ? ui.blockActions : ui.dragToReorder}
              >
                <GripVertical />
              </Button>
            </div>
          ) : null}
          {menuOpen ? (
            <div
              className="absolute z-30 max-h-[280px] w-[260px] overflow-auto rounded-xl border border-[rgba(15,23,42,0.14)] bg-white p-2 shadow-[0_22px_55px_rgba(15,23,42,0.2)]"
              style={{ top: `${menuTop}px`, insetInlineStart: "8px" }}
              data-testid="editor-command-menu"
            >
              <Input
                className="mb-2 h-8 rounded-md border-[rgba(15,23,42,0.12)] px-2 text-xs"
                value={menuQuery}
                onChange={(event) => setMenuQuery(event.target.value)}
                placeholder={menuMode === "slash" ? ui.filterSlashCommands : ui.findBlock}
                aria-label={ui.filterBlockMenuAria}
              />
              <div className="grid gap-1">
                {filteredCommands.length === 0 ? (
                  <span className="px-2 py-1 text-xs text-[#64748b]">{ui.noMatchingBlocks}</span>
                ) : (
                  filteredCommands.map((command) => (
                    <button
                      key={command.id}
                      type="button"
                      className="flex items-center gap-2 rounded-md px-2 py-1 text-left text-xs text-[#1e293b] hover:bg-[rgba(15,118,110,0.1)]"
                      onClick={() => {
                        void runBlockCommand(command);
                      }}
                      data-testid={`editor-command-${command.id}`}
                    >
                      <command.icon className="h-3.5 w-3.5 text-[#0f766e]" />
                      {command.label}
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : null}
          <div className="h-full min-h-0" dir={editorDirection}>
            <EditorContent
              className="h-full"
              editor={editor}
              aria-label={contentPlaceholder}
              data-testid="note-editor-content"
            />
          </div>
        </div>
      </div>

      {mobileSheetOpen ? (
        <div
          className="fixed inset-0 z-50 bg-black/40 p-4"
          onClick={() => setMobileSheetOpen(false)}
          data-testid="editor-block-actions-sheet"
        >
          <div
            className="absolute bottom-4 left-4 right-4 rounded-2xl border border-[rgba(15,23,42,0.14)] bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.25)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#64748b]">
              {ui.blockActionsTitle}
            </div>
            <div className="grid gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  withMobileBlockSelection((instance) => moveCurrentBlock(instance, "up"))
                }
              >
                <ArrowUp className="h-4 w-4" />
                {ui.moveUp}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  withMobileBlockSelection((instance) => moveCurrentBlock(instance, "down"))
                }
              >
                <ArrowDown className="h-4 w-4" />
                {ui.moveDown}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  withMobileBlockSelection((instance) => duplicateCurrentBlock(instance))
                }
              >
                <Copy className="h-4 w-4" />
                {ui.duplicate}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => withMobileBlockSelection((instance) => deleteCurrentBlock(instance))}
              >
                <Trash2 className="h-4 w-4" />
                {ui.delete}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] bg-[#f9fbfd] px-4 py-2 text-xs text-[#5b6474]">
        <span data-testid="editor-metric-words">{`${ui.words}: ${wordCount.toLocaleString(lang)}`}</span>
        <span data-testid="editor-metric-size">{`${ui.size}: ${formatBytes(bytesForText(currentMarkdown), ui)} (${bytesForText(currentMarkdown).toLocaleString(lang)} ${ui.bytesLabel})`}</span>
      </div>
      {uploadState !== "idle" || statusMessage ? (
        <div className="border-t border-[rgba(15,23,42,0.08)] bg-[#fcfdff] px-4 py-2">
          <span
            className="text-xs text-[#5b6474]"
            role="status"
            aria-live="polite"
            data-testid="editor-status-message"
          >
            {uploadState === "uploading"
              ? uploadingLabel
              : uploadState === "error"
                ? statusMessage || uploadFailedLabel
                : statusMessage}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default NoteEditor;
