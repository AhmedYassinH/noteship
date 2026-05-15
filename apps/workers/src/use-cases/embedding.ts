import type { Note } from "@noteship/domain";
import { getNoteById, putNote } from "../adapters/dynamodb/notes";
import { getObjectString } from "../adapters/s3";
import type { Deps } from "../runtime/deps";

const stripNonSearchableDirectives = (input: string): string =>
  input
    .replace(/^:::ns-pdf\s+.*:::$/gim, " ")
    .replace(/^:::ns-attachment\s+.*mime="application\/pdf".*:::$/gim, " ");

const normalizeText = (input: string): string =>
  stripNonSearchableDirectives(input).replace(/\s+/g, " ").trim();

const chunkText = (input: string, maxLength = 2000, overlap = 200): string[] => {
  if (input.length <= maxLength) {
    return [input];
  }

  const chunks: string[] = [];
  let start = 0;
  while (start < input.length) {
    const end = Math.min(start + maxLength, input.length);
    chunks.push(input.slice(start, end));
    start = end - overlap;
    if (start < 0) {
      start = 0;
    }
  }

  return chunks;
};

export const embedNote = async (
  deps: Deps,
  input: { userId: string; noteId: string; s3Key: string; version: string },
): Promise<Note> => {
  const note = await getNoteById(deps.ddb, deps.tableNames.notes, input.userId, input.noteId);
  if (!note) {
    throw new Error("Note not found");
  }

  const rawContent = await getObjectString(deps.s3, deps.bucketName, input.s3Key);
  const normalized = normalizeText(rawContent);
  const chunks = chunkText(normalized);

  const embeddings = await deps.llm.embedTexts({
    inputs: chunks,
    model: deps.llmModels.embeddings,
  });

  const points = embeddings.map((vector, index) => ({
    id: `${input.userId}:${input.noteId}:${input.version}:${index}`,
    vector,
    payload: {
      userId: input.userId,
      noteId: input.noteId,
      version: input.version,
      chunkIndex: index,
      text: chunks[index],
      createdAt: new Date().toISOString(),
    },
  }));

  await deps.vectorDb.upsert({
    collection: deps.vectorDbCollection,
    points,
  });

  if (note.embeddingVersion && note.embeddingVersion !== input.version) {
    await deps.vectorDb.delete({
      collection: deps.vectorDbCollection,
      filter: {
        must: [
          { key: "userId", match: { value: input.userId } },
          { key: "noteId", match: { value: input.noteId } },
        ],
        must_not: [{ key: "version", match: { value: input.version } }],
      },
    });
  }

  const updated: Note = {
    ...note,
    embeddingStatus: "ready",
    embeddingVersion: input.version,
    updatedAt: new Date().toISOString(),
  };

  await putNote(deps.ddb, deps.tableNames.notes, updated);

  return updated;
};
