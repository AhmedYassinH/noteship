import type { Editor } from "@tiptap/react";
import type { SlashRange } from "./editorTypes";

export const detectSlashCommand = (editor: Editor): { query: string; range: SlashRange } | null => {
  const { selection } = editor.state;
  if (!selection.empty) return null;

  const { parent } = selection.$from;
  if (parent.type.name !== "paragraph") return null;

  const prefix = parent.textContent.slice(0, selection.$from.parentOffset);
  const match = prefix.match(/(?:^|\s)\/([a-zA-Z0-9-]*)$/);
  if (!match) return null;

  const query = match[1] || "";
  return { query, range: { from: selection.from - query.length - 1, to: selection.from } };
};
