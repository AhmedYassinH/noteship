import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react";
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
  FileOutput,
  FileInput,
  GripVertical,
  Italic as ItalicIcon,
  Plus,
  Trash2,
} from "lucide-react";
import { Button } from "../../ui/Button";
import { Input } from "../../ui/Input";
import type { Lang } from "../../../data/dashboard";
import type { EditorUiStrings } from "../../../data/note-editor";
import { cn } from "@/lib/utils";
import type {
  BlockCommand,
  CommandMenuAnchor,
  EditorDirection,
  MenuMode,
  TopLevelBlockSelection,
} from "./editorTypes";
import { bytesForText, formatBytes, triggerDownload } from "./editorText";
import { toObsidianMarkdown, type BlockAlign } from "./richNodes";

type ImportExportToolbarProps = {
  currentMarkdown: string;
  noteId: string;
  onImportClick: () => void;
  ui: EditorUiStrings;
};

export const ImportExportToolbar = ({
  currentMarkdown,
  noteId,
  onImportClick,
  ui,
}: ImportExportToolbarProps) => (
  <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-[rgba(15,23,42,0.08)] bg-[#fbfcfd] px-4 py-3">
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="rounded-lg px-3"
      onClick={onImportClick}
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
);

type BubbleToolbarProps = {
  activeBlockDirection: EditorDirection;
  activePhysicalAlign: "left" | "center" | "right";
  applyAlignment: (align: BlockAlign) => void;
  applyBlockDirection: (direction: EditorDirection) => void;
  editor: Editor;
  isCoarsePointer: boolean;
  isTyping: boolean;
  menuOpen: boolean;
  ui: EditorUiStrings;
};

export const BubbleToolbar = ({
  activeBlockDirection,
  activePhysicalAlign,
  applyAlignment,
  applyBlockDirection,
  editor,
  isCoarsePointer,
  isTyping,
  menuOpen,
  ui,
}: BubbleToolbarProps) => (
  <BubbleMenu
    editor={editor}
    tippyOptions={{ duration: 120, placement: "top" }}
    shouldShow={({ editor: bubbleEditor }) => {
      if (!bubbleEditor.isFocused || menuOpen || isCoarsePointer || isTyping) return false;
      const { selection } = bubbleEditor.state;
      if (!selection.empty) return true;
      return selection.$from.parent.textContent.trim().length === 0;
    }}
    className="flex flex-wrap items-center gap-1 rounded-xl border border-[rgba(15,23,42,0.14)] bg-white p-1 shadow-[0_14px_35px_rgba(15,23,42,0.16)]"
  >
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-7 rounded-md px-2 text-xs", editor.isActive("bold") && "bg-accent")}
      onClick={() => editor.chain().focus().toggleBold().run()}
      data-testid="editor-toolbar-bold"
    >
      <BoldIcon className="h-3.5 w-3.5" />
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-7 rounded-md px-2 text-xs", editor.isActive("italic") && "bg-accent")}
      onClick={() => editor.chain().focus().toggleItalic().run()}
      data-testid="editor-toolbar-italic"
    >
      <ItalicIcon className="h-3.5 w-3.5" />
    </Button>
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("h-7 rounded-md px-2 text-xs", activeBlockDirection === "ltr" && "bg-accent")}
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
      className={cn("h-7 rounded-md px-2 text-xs", activeBlockDirection === "rtl" && "bg-accent")}
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
      className={cn("h-7 rounded-md px-2 text-xs", activePhysicalAlign === "left" && "bg-accent")}
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
      className={cn("h-7 rounded-md px-2 text-xs", activePhysicalAlign === "center" && "bg-accent")}
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
      className={cn("h-7 rounded-md px-2 text-xs", activePhysicalAlign === "right" && "bg-accent")}
      onClick={() => applyAlignment("right")}
      data-testid="editor-align-right"
      title={ui.alignRight}
    >
      <AlignRight className="h-3.5 w-3.5" />
    </Button>
  </BubbleMenu>
);

type BlockControlsProps = {
  blockControlsTop: number;
  compact: boolean;
  isCoarsePointer: boolean;
  onAddBlock: (event: ReactMouseEvent<HTMLButtonElement>) => void;
  onDragEnd: () => void;
  onDragHandle: () => void;
  onDragStart: (event: ReactDragEvent<HTMLButtonElement>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  ui: EditorUiStrings;
  visible: boolean;
};

export const BlockControls = ({
  blockControlsTop,
  compact,
  isCoarsePointer,
  onAddBlock,
  onDragEnd,
  onDragHandle,
  onDragStart,
  onMouseEnter,
  onMouseLeave,
  ui,
  visible,
}: BlockControlsProps) => {
  if (!visible) return null;

  return (
    <div
      data-editor-block-controls="true"
      className={cn(
        "absolute z-20 flex",
        compact ? "flex-col items-center gap-0.5 pe-3" : "items-center gap-0.5 pe-[18px]",
      )}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        top: `${blockControlsTop}px`,
        insetInlineStart: "8px",
      }}
    >
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 rounded-md bg-white/90 text-[#64748b] shadow-none hover:bg-[#eef2f4] hover:text-[#0f172a] [&_svg]:h-3.5 [&_svg]:w-3.5"
        onClick={onAddBlock}
        data-testid="editor-side-add-block"
      >
        <Plus />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7 cursor-grab rounded-md bg-white/90 text-[#64748b] shadow-none hover:bg-[#eef2f4] hover:text-[#0f172a] active:cursor-grabbing [&_svg]:h-3.5 [&_svg]:w-3.5"
        onClick={onDragHandle}
        draggable={!isCoarsePointer}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        data-testid="editor-block-drag-handle"
        title={isCoarsePointer ? ui.blockActions : ui.dragToReorder}
      >
        <GripVertical />
      </Button>
    </div>
  );
};

type CommandMenuProps = {
  anchor: CommandMenuAnchor;
  commands: BlockCommand[];
  direction: EditorDirection;
  menuMode: MenuMode;
  menuQuery: string;
  onQueryChange: (query: string) => void;
  onRunCommand: (command: BlockCommand) => void;
  ui: EditorUiStrings;
};

export const CommandMenu = ({
  anchor,
  commands,
  direction,
  menuMode,
  menuQuery,
  onQueryChange,
  onRunCommand,
  ui,
}: CommandMenuProps) => {
  if (typeof document === "undefined") return null;

  const edgeGap = 8;
  const anchorGap = 8;
  const menuWidth = 260;
  const preferredHeight = 280;
  const availableAbove = Math.max(0, anchor.top - anchorGap - edgeGap);
  const availableBelow = Math.max(0, window.innerHeight - anchor.bottom - anchorGap - edgeGap);
  const placement =
    availableBelow >= preferredHeight || availableBelow >= availableAbove ? "bottom" : "top";
  const availableHeight = placement === "bottom" ? availableBelow : availableAbove;
  const maxHeight = Math.min(preferredHeight, availableHeight);
  const preferredLeft = direction === "rtl" ? anchor.right - menuWidth : anchor.left;
  const left = Math.min(
    Math.max(edgeGap, preferredLeft),
    Math.max(edgeGap, window.innerWidth - menuWidth - edgeGap),
  );

  return createPortal(
    <div
      className="fixed z-[80] flex w-[260px] flex-col overflow-hidden rounded-xl border border-[rgba(15,23,42,0.14)] bg-white p-2 shadow-[0_22px_55px_rgba(15,23,42,0.2)]"
      style={{
        left: `${left}px`,
        maxHeight: `${maxHeight}px`,
        ...(placement === "bottom"
          ? { top: `${anchor.bottom + anchorGap}px` }
          : { bottom: `${window.innerHeight - anchor.top + anchorGap}px` }),
      }}
      data-placement={placement}
      data-testid="editor-command-menu"
      dir={direction}
    >
      <Input
        className="mb-2 h-8 shrink-0 rounded-md border-[rgba(15,23,42,0.12)] px-2 text-xs"
        value={menuQuery}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder={menuMode === "slash" ? ui.filterSlashCommands : ui.findBlock}
        aria-label={ui.filterBlockMenuAria}
      />
      <div className="grid min-h-0 gap-1 overflow-y-auto">
        {commands.length === 0 ? (
          <span className="px-2 py-1 text-xs text-[#64748b]">{ui.noMatchingBlocks}</span>
        ) : (
          commands.map((command) => (
            <button
              key={command.id}
              type="button"
              className="flex items-center gap-2 rounded-md px-2 py-1 text-start text-xs text-[#1e293b] hover:bg-[rgba(15,118,110,0.1)]"
              onClick={() => onRunCommand(command)}
              data-testid={`editor-command-${command.id}`}
            >
              <command.icon className="h-3.5 w-3.5 text-[#0f766e]" />
              {command.label}
            </button>
          ))
        )}
      </div>
    </div>,
    document.body,
  );
};

type MobileBlockActionsSheetProps = {
  onClose: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveDown: () => void;
  onMoveUp: () => void;
  open: boolean;
  ui: EditorUiStrings;
};

export const MobileBlockActionsSheet = ({
  onClose,
  onDelete,
  onDuplicate,
  onMoveDown,
  onMoveUp,
  open,
  ui,
}: MobileBlockActionsSheetProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 p-4"
      onClick={onClose}
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
          <Button type="button" variant="outline" size="sm" onClick={onMoveUp}>
            <ArrowUp className="h-4 w-4" />
            {ui.moveUp}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onMoveDown}>
            <ArrowDown className="h-4 w-4" />
            {ui.moveDown}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
            {ui.duplicate}
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            {ui.delete}
          </Button>
        </div>
      </div>
    </div>
  );
};

type EditorStatusFooterProps = {
  currentMarkdown: string;
  lang: Lang;
  statusMessage: string | null;
  ui: EditorUiStrings;
  uploadFailedLabel: string;
  uploadingLabel: string;
  uploadState: "idle" | "uploading" | "error";
  wordCount: number;
};

export const EditorStatusFooter = ({
  currentMarkdown,
  lang,
  statusMessage,
  ui,
  uploadFailedLabel,
  uploadingLabel,
  uploadState,
  wordCount,
}: EditorStatusFooterProps) => {
  const sizeBytes = bytesForText(currentMarkdown);

  return (
    <>
      <div
        className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-[rgba(15,23,42,0.08)] bg-[#f9fbfd] px-4 py-2 text-xs text-[#5b6474]"
        data-testid="editor-metrics-footer"
      >
        <span data-testid="editor-metric-words">{`${ui.words}: ${wordCount.toLocaleString(lang)}`}</span>
        <span data-testid="editor-metric-size">{`${ui.size}: ${formatBytes(
          sizeBytes,
          ui,
        )} (${sizeBytes.toLocaleString(lang)} ${ui.bytesLabel})`}</span>
      </div>
      {uploadState !== "idle" || statusMessage ? (
        <div className="shrink-0 border-t border-[rgba(15,23,42,0.08)] bg-[#fcfdff] px-4 py-2">
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
    </>
  );
};
