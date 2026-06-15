import type { Editor } from "@tiptap/react";
import type { TopLevelBlockSelection } from "./editorTypes";

export const BLOCK_CONTROL_SIZE_PX = 28;
export const BLOCK_CONTROL_OFFSET_PX = 65;
export const DRAG_BLOCK_MIME = "application/x-noteship-block-index";

const clampNumber = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

export const getBlockControlTop = (
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

export const getTopLevelBlockFromPos = (
  editor: Editor,
  pos: number,
): TopLevelBlockSelection | null => {
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

export const getTopLevelBlockSelection = (editor: Editor): TopLevelBlockSelection | null => {
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

export const topLevelChildPos = (editor: Editor, index: number): number => {
  let pos = 0;
  for (let i = 0; i < index; i += 1) {
    pos += editor.state.doc.child(i).nodeSize;
  }
  return pos;
};

export const moveCurrentBlock = (editor: Editor, direction: "up" | "down"): boolean => {
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

export const moveBlockToIndex = (editor: Editor, fromIndex: number, toIndex: number): boolean => {
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

export const duplicateCurrentBlock = (editor: Editor): boolean => {
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

export const deleteCurrentBlock = (editor: Editor): boolean => {
  const block = getTopLevelBlockSelection(editor);
  if (!block) return false;

  const { state, view } = editor;
  const tr = state.tr;
  tr.delete(block.pos, block.pos + block.size);
  view.dispatch(tr.scrollIntoView());
  editor.commands.focus(Math.max(1, Math.min(block.pos, tr.doc.content.size)));
  return true;
};

export const selectCurrentBlock = (editor: Editor): boolean => {
  const block = getTopLevelBlockSelection(editor);
  if (!block) return false;

  const { state } = editor;
  const node = state.doc.nodeAt(block.pos);
  if (!node || node.type.spec.selectable === false) {
    return false;
  }

  return editor.chain().focus().setNodeSelection(block.pos).run();
};

export const selectBlockByPos = (editor: Editor, pos: number): boolean =>
  editor.chain().focus().setNodeSelection(pos).run();
