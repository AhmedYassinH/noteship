import { createHash, randomUUID } from "node:crypto";
import type { Note } from "@noteship/domain";
import { deleteNote, getNoteById, listNotes, putNote } from "../adapters/dynamodb/notes";
import {
  createPresignedPutUrl,
  deleteObject,
  getObjectString,
  putObjectString,
} from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { badRequest, notFound } from "../runtime/errors";
import { buildNoteArtifactKey, buildNoteContentKey } from "@noteship/utils";
import { FEATURE_KEYS, assertCapacityEntitlement, incrementUsageByAmount } from "./entitlements";

const hashContent = (content: string): string => createHash("sha256").update(content).digest("hex");

const nowIso = (): string => new Date().toISOString();

export const createNote = async (
  deps: Deps,
  userId: string,
  input: {
    title: string;
    content: string;
    tags?: string[];
    editorFormat?: "tiptap" | "markdown";
  },
): Promise<Note> => {
  const noteId = randomUUID();
  const s3Key = buildNoteContentKey(userId, noteId);
  const contentHash = hashContent(input.content);
  const now = nowIso();

  const note: Note = {
    userId,
    noteId,
    title: input.title,
    tags: input.tags ?? [],
    s3Key,
    contentHash,
    embeddingStatus: "pending",
    embeddingVersion: contentHash,
    editorFormat: input.editorFormat,
    createdAt: now,
    updatedAt: now,
  };

  await putObjectString(deps.s3, deps.bucketName, s3Key, input.content);
  await putNote(deps.ddb, deps.tableNames.notes, note);

  await enqueueJob(deps.sqs, deps.jobsQueueUrl, {
    jobId: randomUUID(),
    type: "EMBED_NOTE",
    userId,
    createdAt: now,
    payload: {
      noteId,
      s3Key,
      version: contentHash,
    },
  });

  return note;
};

export const updateNote = async (
  deps: Deps,
  userId: string,
  noteId: string,
  input: {
    title?: string;
    content?: string;
    tags?: string[];
    editorFormat?: "tiptap" | "markdown";
  },
): Promise<Note> => {
  const existing = await getNoteById(deps.ddb, deps.tableNames.notes, userId, noteId);

  if (!existing) {
    throw notFound("Note not found");
  }

  const nextContent =
    input.content ?? (await getObjectString(deps.s3, deps.bucketName, existing.s3Key));
  const contentHash = hashContent(nextContent);
  const now = nowIso();

  const updated: Note = {
    ...existing,
    title: input.title ?? existing.title,
    tags: input.tags ?? existing.tags,
    editorFormat: input.editorFormat ?? existing.editorFormat,
    contentHash,
    embeddingStatus: "pending",
    embeddingVersion: contentHash,
    updatedAt: now,
  };

  if (input.content) {
    await putObjectString(deps.s3, deps.bucketName, existing.s3Key, input.content);
  }

  await putNote(deps.ddb, deps.tableNames.notes, updated);
  await enqueueJob(deps.sqs, deps.jobsQueueUrl, {
    jobId: randomUUID(),
    type: "EMBED_NOTE",
    userId,
    createdAt: now,
    payload: {
      noteId,
      s3Key: existing.s3Key,
      version: contentHash,
    },
  });

  return updated;
};

export const getNote = async (
  deps: Deps,
  userId: string,
  noteId: string,
): Promise<{ note: Note; content: string }> => {
  const note = await getNoteById(deps.ddb, deps.tableNames.notes, userId, noteId);
  if (!note) {
    throw notFound("Note not found");
  }

  const content = await getObjectString(deps.s3, deps.bucketName, note.s3Key);
  return { note, content };
};

export const listNotesForUser = async (
  deps: Deps,
  userId: string,
  limit?: number,
  cursor?: string,
): Promise<{ items: Note[]; nextCursor?: string }> =>
  listNotes(deps.ddb, deps.tableNames.notes, userId, limit, cursor);

export const deleteNoteById = async (deps: Deps, userId: string, noteId: string): Promise<void> => {
  const note = await getNoteById(deps.ddb, deps.tableNames.notes, userId, noteId);
  if (!note) {
    throw notFound("Note not found");
  }

  await deleteObject(deps.s3, deps.bucketName, note.s3Key);
  await deleteNote(deps.ddb, deps.tableNames.notes, userId, noteId);
};

export const createNoteUploadUrl = async (
  deps: Deps,
  userId: string,
  noteId: string,
  filename: string,
  contentType: string,
  sizeBytes: number,
): Promise<{ uploadUrl: string; s3Key: string; artifactId: string; publicUrl: string }> => {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw badRequest("sizeBytes must be a positive number");
  }

  const note = await getNoteById(deps.ddb, deps.tableNames.notes, userId, noteId);
  if (!note) {
    throw notFound("Note not found");
  }

  const sizeMb = Math.round((sizeBytes / (1024 * 1024)) * 1000) / 1000;
  const { periodStart } = await assertCapacityEntitlement(
    deps,
    userId,
    FEATURE_KEYS.maxStorageMb,
    "storageUsedMb",
    sizeMb,
  );
  await incrementUsageByAmount(deps, userId, periodStart, "storageUsedMb", sizeMb);

  const extension = filename.includes(".") ? filename.split(".").pop() : "bin";
  if (!extension) {
    throw badRequest("filename must include an extension");
  }

  const artifactId = randomUUID();
  const s3Key = buildNoteArtifactKey(userId, noteId, artifactId, extension);
  const uploadUrl = await createPresignedPutUrl(deps.s3, deps.bucketName, s3Key, contentType);
  const publicUrl = `https://${deps.contentDomain}/${s3Key}`;

  return { uploadUrl, s3Key, artifactId, publicUrl };
};
