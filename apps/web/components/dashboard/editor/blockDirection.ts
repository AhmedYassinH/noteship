import type { Editor } from "@tiptap/react";
import { parseBlockDirection } from "./richNodes";
import type { EditorDirection } from "./editorTypes";

export const getActiveTextBlockDirection = (editor: Editor): EditorDirection | null => {
  if (editor.isActive("heading")) {
    return parseBlockDirection(editor.getAttributes("heading").dir);
  }
  if (editor.isActive("paragraph")) {
    return parseBlockDirection(editor.getAttributes("paragraph").dir);
  }
  return null;
};

export const applyDirectionToActiveTextBlock = (
  editor: Editor,
  direction: EditorDirection,
): boolean => {
  if (editor.isActive("heading")) {
    return editor.chain().focus().updateAttributes("heading", { dir: direction }).run();
  }
  if (editor.isActive("paragraph")) {
    return editor.chain().focus().updateAttributes("paragraph", { dir: direction }).run();
  }
  return false;
};
