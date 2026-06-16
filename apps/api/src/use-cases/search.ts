import type { Note } from "@noteship/domain";
import { batchGetNotesByIds } from "../adapters/dynamodb/notes";
import type { Deps } from "../runtime/deps";
import { assertCan } from "./policy";

export type SearchResult = {
  note: Note;
  score: number;
  preview?: string;
  chunkIndex?: number;
};

export const searchNotes = async (
  deps: Deps,
  userId: string,
  query: string,
  limit = 10,
): Promise<SearchResult[]> => {
  await assertCan(deps, userId, "search.query");

  if (!deps.embeddingsEnabled) {
    return [];
  }

  const [embedding] = await deps.llm.embedTexts({
    inputs: [query],
    model: deps.llmModels.embeddings,
  });

  if (!embedding) {
    return [];
  }

  const hits = await deps.vectorDb.search({
    collection: deps.vectorDbCollection,
    vector: embedding,
    limit,
    userId,
  });

  const grouped = new Map<
    string,
    {
      score: number;
      preview?: string;
      chunkIndex?: number;
    }
  >();

  for (const hit of hits) {
    const noteId = String(hit.payload.noteId ?? "");
    if (!noteId) {
      continue;
    }

    const existing = grouped.get(noteId);
    if (!existing || hit.score > existing.score) {
      grouped.set(noteId, {
        score: hit.score,
        preview: typeof hit.payload.text === "string" ? hit.payload.text : undefined,
        chunkIndex: typeof hit.payload.chunkIndex === "number" ? hit.payload.chunkIndex : undefined,
      });
    }
  }

  const noteIds = Array.from(grouped.keys());
  const notes = await batchGetNotesByIds(deps.ddb, deps.tableNames.notes, userId, noteIds);
  const notesById = new Map(notes.map((note) => [note.noteId, note]));

  const results: SearchResult[] = [];

  for (const noteId of noteIds) {
    const note = notesById.get(noteId);
    const meta = grouped.get(noteId);
    if (!note || !meta) {
      continue;
    }

    results.push({
      note,
      score: meta.score,
      preview: meta.preview,
      chunkIndex: meta.chunkIndex,
    });
  }

  return results;
};
