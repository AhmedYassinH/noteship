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
import { EditorContent, Extension, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { Markdown } from "tiptap-markdown";
import { Input } from "../ui/Input";
import {
  AlignedHeading,
  AlignedParagraph,
  AttachmentBlockNode,
  PdfEmbedNode,
  RichImage,
  VideoEmbedNode,
  noteshipDirectivesToEditorHtml,
  parseAlign,
  parseVideoEmbed,
  type BlockAlign,
} from "./editor/richNodes";
import { cn } from "@/lib/utils";
import type { Lang } from "../../data/dashboard";
import { editorUiCopy } from "../../data/note-editor";
import {
  DRAG_BLOCK_MIME,
  deleteCurrentBlock,
  duplicateCurrentBlock,
  getBlockControlTop,
  getTopLevelBlockFromPos,
  getTopLevelBlockSelection,
  moveBlockToIndex,
  moveCurrentBlock,
  selectBlockByPos,
  selectCurrentBlock,
  topLevelChildPos,
} from "./editor/blockOperations";
import {
  applyDirectionToActiveTextBlock,
  getActiveTextBlockDirection,
} from "./editor/blockDirection";
import {
  BubbleToolbar,
  BlockControls,
  CommandMenu,
  EditorStatusFooter,
  ImportExportToolbar,
  MobileBlockActionsSheet,
  blockControlsBottom,
} from "./editor/NoteEditorPanels";
import { countWords, getCurrentMarkdown } from "./editor/editorText";
import type {
  BlockCommand,
  EditorDirection,
  MenuMode,
  SlashRange,
  TopLevelBlockSelection,
} from "./editor/editorTypes";
import { detectSlashCommand } from "./editor/slashCommands";
import { useBlockCommands } from "./editor/useBlockCommands";
import { useEmbeddedAssetSession } from "./editor/useEmbeddedAssetSession";
import { importMarkdownFile, useEditorUploads } from "./editor/useEditorUploads";

type Props = {
  lang: Lang;
  noteId: string;
  title: string;
  content: string;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  titlePlaceholder: string;
  contentPlaceholder: string;
  uploadingLabel: string;
  uploadFailedLabel: string;
  editorDirection: EditorDirection;
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
  uploadingLabel,
  uploadFailedLabel,
  editorDirection,
}: Props) => {
  const editorShellRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const markdownInputRef = useRef<HTMLInputElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentMarkdown, setCurrentMarkdown] = useState(content);
  const [wordCount, setWordCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMode, setMenuMode] = useState<MenuMode>("insert");
  const [menuQuery, setMenuQuery] = useState("");
  const [slashRange, setSlashRange] = useState<SlashRange | null>(null);
  const [insertAnchorBlock, setInsertAnchorBlock] = useState<TopLevelBlockSelection | null>(null);
  const [menuTop, setMenuTop] = useState(52);
  const [selectionVersion, setSelectionVersion] = useState(0);
  const [isCoarsePointer, setIsCoarsePointer] = useState(false);
  const [hoverBlock, setHoverBlock] = useState<TopLevelBlockSelection | null>(null);
  const [pinnedBlock, setPinnedBlock] = useState<TopLevelBlockSelection | null>(null);
  const [notePreferredBlockDirection, setNotePreferredBlockDirection] =
    useState<EditorDirection>(editorDirection);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const [mobileSheetBlock, setMobileSheetBlock] = useState<TopLevelBlockSelection | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const draggingBlockRef = useRef<TopLevelBlockSelection | null>(null);
  const editorInstanceRef = useRef<Editor | null>(null);
  const menuModeRef = useRef<MenuMode>("insert");
  const hoverIndexRef = useRef<number | null>(null);
  const typingResetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearPinnedBlockTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preferredBlockDirectionRef = useRef<EditorDirection>(editorDirection);
  const ui = useMemo(() => editorUiCopy[lang], [lang]);
  const uiRef = useRef(ui);
  const initialEditorContent = useMemo(() => noteshipDirectivesToEditorHtml(content), [content]);
  const embeddedAssetsReady = useEmbeddedAssetSession(content);

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
    content: initialEditorContent,
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

  const {
    fileAccept,
    handleUploadInputChange,
    openUploadPicker,
    setStatusMessage,
    statusMessage,
    uploadState,
  } = useEditorUploads({
    editor,
    noteId,
    fileInputRef,
    ui,
    uploadFailedLabel,
  });

  useEffect(() => {
    if (!editor || !isReady) return;
    const current = getCurrentMarkdown(editor);
    if (current === content) return;
    editor.commands.setContent(noteshipDirectivesToEditorHtml(content));
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
  }, [editor, setStatusMessage, ui.pasteVideoUrlPrompt, ui.unsupportedVideoProvider]);

  const applyBlockDirection = useCallback(
    (direction: EditorDirection) => {
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

  const blockCommands = useBlockCommands({
    commands: ui.commands,
    editor,
    embedVideoFromLink: handleEmbedVideoFromLink,
    openUploadPicker,
    preferredBlockDirectionRef,
  });

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
  const activeBlockDirection = useMemo<EditorDirection>(() => {
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

  const currentBlock = selectionVersion >= 0 && editor ? getTopLevelBlockSelection(editor) : null;

  useEffect(() => {
    if (!editor) return;
    const blockDirection = getActiveTextBlockDirection(editor);
    if (blockDirection) {
      setNotePreferredBlockDirection(blockDirection);
    }
  }, [editor, selectionVersion]);

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
  }, [
    editor,
    hoverBlock,
    isCoarsePointer,
    pinBlockControls,
    setStatusMessage,
    ui.blockSelectedForDrag,
  ]);

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
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData(DRAG_BLOCK_MIME, String(targetBlock.index));
      event.dataTransfer.setData("text/plain", "");
    },
    [editor, hoverBlock, isCoarsePointer, pinBlockControls],
  );

  const handleGripDragEnd = useCallback(() => {
    draggingBlockRef.current = null;
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
  const blockControlsVisible = embeddedAssetsReady && !!visibleBlock;
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
      <ImportExportToolbar
        currentMarkdown={currentMarkdown}
        noteId={noteId}
        onImportClick={() => markdownInputRef.current?.click()}
        ui={ui}
      />

      <div className="flex min-h-0 flex-1 flex-col gap-3 p-[18px]">
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept={fileAccept}
          onChange={handleUploadInputChange}
        />
        <input
          ref={markdownInputRef}
          type="file"
          accept=".md,text/markdown"
          hidden
          onChange={async (event) => {
            const file = event.target.files?.[0] || null;
            await importMarkdownFile(file, editor, ui, setStatusMessage);
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
          {editor && embeddedAssetsReady ? (
            <BubbleToolbar
              activeBlockDirection={activeBlockDirection}
              activePhysicalAlign={activePhysicalAlign}
              applyAlignment={applyAlignment}
              applyBlockDirection={applyBlockDirection}
              editor={editor}
              isCoarsePointer={isCoarsePointer}
              isTyping={isTyping}
              menuOpen={menuOpen}
              ui={ui}
            />
          ) : null}
          <BlockControls
            blockControlsTop={blockControlsTop}
            isCoarsePointer={isCoarsePointer}
            onAddBlock={() =>
              openInsertMenuAt(blockControlsBottom(blockControlsTop), visibleBlock ?? currentBlock)
            }
            onDragEnd={handleGripDragEnd}
            onDragHandle={handleDragHandle}
            onDragStart={handleGripDragStart}
            onMouseEnter={handleBlockControlsMouseEnter}
            onMouseLeave={handleBlockControlsMouseLeave}
            ui={ui}
            visible={blockControlsVisible}
          />
          {menuOpen ? (
            <CommandMenu
              commands={filteredCommands}
              menuMode={menuMode}
              menuQuery={menuQuery}
              menuTop={menuTop}
              onQueryChange={setMenuQuery}
              onRunCommand={(command) => {
                void runBlockCommand(command);
              }}
              ui={ui}
            />
          ) : null}
          <div className="h-full min-h-0" dir={editorDirection}>
            {embeddedAssetsReady ? (
              <EditorContent
                className="h-full"
                editor={editor}
                aria-label={contentPlaceholder}
                data-testid="note-editor-content"
              />
            ) : (
              <div
                className="flex h-full min-h-[460px] items-center justify-center rounded-[18px] border border-[rgba(15,23,42,0.12)] bg-[#f8fafc] text-sm text-[#64748b]"
                role="status"
                aria-live="polite"
              >
                {ui.preparingEmbeddedAssets}
              </div>
            )}
          </div>
        </div>
      </div>

      <MobileBlockActionsSheet
        onClose={() => setMobileSheetOpen(false)}
        onDelete={() => withMobileBlockSelection((instance) => deleteCurrentBlock(instance))}
        onDuplicate={() => withMobileBlockSelection((instance) => duplicateCurrentBlock(instance))}
        onMoveDown={() =>
          withMobileBlockSelection((instance) => moveCurrentBlock(instance, "down"))
        }
        onMoveUp={() => withMobileBlockSelection((instance) => moveCurrentBlock(instance, "up"))}
        open={mobileSheetOpen}
        ui={ui}
      />

      <EditorStatusFooter
        currentMarkdown={currentMarkdown}
        lang={lang}
        statusMessage={statusMessage}
        ui={ui}
        uploadFailedLabel={uploadFailedLabel}
        uploadingLabel={uploadingLabel}
        uploadState={uploadState}
        wordCount={wordCount}
      />
    </div>
  );
};

export default NoteEditor;
