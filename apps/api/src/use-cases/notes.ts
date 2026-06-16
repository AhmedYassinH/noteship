import { createHash, randomUUID } from "node:crypto";
import type { Note, UploadLease } from "@noteship/domain";
import { deleteNote, getNoteById, listNotes, putNote } from "../adapters/dynamodb/notes";
import {
  createPresignedPutUrl,
  copyObject,
  deleteObject,
  getObjectString,
  headObject,
  putObjectString,
} from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { badRequest, notFound } from "../runtime/errors";
import {
  buildNoteArtifactKey,
  buildNoteContentKey,
  buildTemporaryNoteArtifactKey,
} from "@noteship/utils";
import { decrementUserCounter } from "../adapters/dynamodb/users";
import {
  abandonUploadLease,
  completeUploadLease,
  createUploadLease,
  getUploadLease,
  releaseExpiredUploadLeases,
} from "../adapters/dynamodb/upload-leases";
import { assertAndConsumeNoteCapacity, assertCan, getStorageCapacityLimit } from "./policy";

const hashContent = (content: string): string => createHash("sha256").update(content).digest("hex");

const nowIso = (): string => new Date().toISOString();

const toPublicContentUrl = (contentDomain: string, s3Key: string): string =>
  `https://${contentDomain}/${s3Key.split("/").map(encodeURIComponent).join("/")}`;

const addMinutesIso = (minutes: number): string =>
  new Date(Date.now() + minutes * 60 * 1000).toISOString();

const addDaysEpoch = (days: number): number =>
  Math.floor((Date.now() + days * 24 * 60 * 60 * 1000) / 1000);

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
  await assertAndConsumeNoteCapacity(deps, userId);

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

  try {
    await putObjectString(deps.s3, deps.bucketName, s3Key, input.content);
    await putNote(deps.ddb, deps.tableNames.notes, note);
  } catch (error) {
    await decrementUserCounter(deps.ddb, deps.tableNames.users, userId, "notesUsed");
    throw error;
  }

  if (deps.embeddingsEnabled) {
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
  }

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
  if (deps.embeddingsEnabled) {
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
  }

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
  await decrementUserCounter(deps.ddb, deps.tableNames.users, userId, "notesUsed");
};

export const createNoteUploadUrl = async (
  deps: Deps,
  userId: string,
  noteId: string,
  filename: string,
  contentType: string,
  sizeBytes: number,
  intent: "embed" | "attach",
  artifactType: "image" | "pdf",
): Promise<{
  uploadUrl: string;
  s3Key: string;
  artifactId: string;
  publicUrl: string;
  expiresAt: string;
}> => {
  await assertCan(deps, userId, "note.upload");

  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    throw badRequest("sizeBytes must be a positive number");
  }

  if (contentType.startsWith("video/")) {
    throw badRequest("Video uploads are not supported yet. Embed a link instead.");
  }

  const maxImageBytes = 5 * 1024 * 1024;
  const maxPdfEmbedBytes = 1 * 1024 * 1024;
  const maxPdfAttachmentBytes = 5 * 1024 * 1024;

  if (artifactType === "image") {
    if (!contentType.startsWith("image/")) {
      throw badRequest("Image uploads must use an image content type.");
    }
    if (sizeBytes > maxImageBytes) {
      throw badRequest("Image uploads are limited to 5 MB per file.");
    }
  }

  if (artifactType === "pdf") {
    if (contentType !== "application/pdf") {
      throw badRequest("PDF uploads must use application/pdf content type.");
    }
    const maxPdfBytes = intent === "embed" ? maxPdfEmbedBytes : maxPdfAttachmentBytes;
    if (sizeBytes > maxPdfBytes) {
      if (intent === "embed") {
        throw badRequest("Embedded PDFs are limited to 1 MB.");
      }
      throw badRequest("Attached PDFs are limited to 5 MB.");
    }
  }

  const note = await getNoteById(deps.ddb, deps.tableNames.notes, userId, noteId);
  if (!note) {
    throw notFound("Note not found");
  }
  await releaseExpiredUploadLeases(deps.ddb, {
    usersTableName: deps.tableNames.users,
    uploadLeasesTableName: deps.tableNames.uploadLeases,
    userId,
    nowIso: nowIso(),
    expiresAtEpoch: addDaysEpoch(deps.tempUploadLifecycleDays),
  });

  const extension = filename.includes(".") ? filename.split(".").pop() : "bin";
  if (!extension) {
    throw badRequest("filename must include an extension");
  }

  const artifactId = randomUUID();
  const finalS3Key = buildNoteArtifactKey(userId, noteId, artifactId, extension);
  const uploadS3Key = buildTemporaryNoteArtifactKey(userId, noteId, artifactId, extension);
  const sizeMb = Math.ceil((sizeBytes / (1024 * 1024)) * 1000) / 1000;
  const expiresAt = addMinutesIso(deps.tempUploadExpiryMinutes);
  const lease: UploadLease = {
    userId,
    artifactId,
    noteId,
    s3Key: uploadS3Key,
    finalS3Key,
    sizeBytes,
    sizeMb,
    status: "reserved",
    createdAt: nowIso(),
    updatedAt: nowIso(),
    expiresAt,
  };
  const storageLimitMb = await getStorageCapacityLimit(deps, userId);
  await createUploadLease(deps.ddb, {
    usersTableName: deps.tableNames.users,
    uploadLeasesTableName: deps.tableNames.uploadLeases,
    lease,
    storageLimitMb,
  });

  let uploadUrl: string;
  try {
    uploadUrl = await createPresignedPutUrl(
      deps.s3,
      deps.bucketName,
      uploadS3Key,
      contentType,
      deps.tempUploadExpiryMinutes * 60,
    );
  } catch (error) {
    await abandonUploadLease(deps.ddb, {
      usersTableName: deps.tableNames.users,
      uploadLeasesTableName: deps.tableNames.uploadLeases,
      userId,
      artifactId,
      sizeMb,
      expiresAtEpoch: addDaysEpoch(deps.tempUploadLifecycleDays),
    });
    throw error;
  }
  const publicUrl = toPublicContentUrl(deps.contentDomain, finalS3Key);

  return { uploadUrl, s3Key: finalS3Key, artifactId, publicUrl, expiresAt };
};

export const completeNoteUpload = async (
  deps: Deps,
  userId: string,
  noteId: string,
  artifactId: string,
): Promise<void> => {
  const lease = await getUploadLease(deps.ddb, deps.tableNames.uploadLeases, userId, artifactId);
  if (!lease || lease.noteId !== noteId) {
    throw notFound("Upload lease not found");
  }

  if (lease.status === "completed") {
    return;
  }
  if (lease.status !== "reserved") {
    throw badRequest("Upload lease is not active");
  }
  if (lease.expiresAt <= nowIso()) {
    await abandonUploadLease(deps.ddb, {
      usersTableName: deps.tableNames.users,
      uploadLeasesTableName: deps.tableNames.uploadLeases,
      userId,
      artifactId,
      sizeMb: lease.sizeMb,
      expiresAtEpoch: addDaysEpoch(deps.tempUploadLifecycleDays),
    });
    throw badRequest("Upload lease expired");
  }

  const object = await headObject(deps.s3, deps.bucketName, lease.s3Key);
  if (!object.sizeBytes || object.sizeBytes <= 0) {
    throw badRequest("Uploaded object is empty");
  }
  if (object.sizeBytes > lease.sizeBytes) {
    await abandonUploadLease(deps.ddb, {
      usersTableName: deps.tableNames.users,
      uploadLeasesTableName: deps.tableNames.uploadLeases,
      userId,
      artifactId,
      sizeMb: lease.sizeMb,
      expiresAtEpoch: addDaysEpoch(deps.tempUploadLifecycleDays),
    });
    await deleteObject(deps.s3, deps.bucketName, lease.s3Key);
    throw badRequest("Uploaded object exceeds reserved size");
  }

  const finalS3Key = lease.finalS3Key ?? lease.s3Key;
  if (finalS3Key !== lease.s3Key) {
    await copyObject(deps.s3, deps.bucketName, lease.s3Key, finalS3Key);
  }

  await completeUploadLease(deps.ddb, {
    usersTableName: deps.tableNames.users,
    uploadLeasesTableName: deps.tableNames.uploadLeases,
    userId,
    artifactId,
    sizeMb: lease.sizeMb,
    expiresAtEpoch: addDaysEpoch(deps.tempUploadLifecycleDays),
  });

  if (finalS3Key !== lease.s3Key) {
    try {
      await deleteObject(deps.s3, deps.bucketName, lease.s3Key);
    } catch {
      // The content bucket lifecycle rule expires temporary uploads if cleanup is delayed.
    }
  }
};

export const abandonNoteUpload = async (
  deps: Deps,
  userId: string,
  noteId: string,
  artifactId: string,
): Promise<void> => {
  const lease = await getUploadLease(deps.ddb, deps.tableNames.uploadLeases, userId, artifactId);
  if (!lease || lease.noteId !== noteId) {
    throw notFound("Upload lease not found");
  }

  await abandonUploadLease(deps.ddb, {
    usersTableName: deps.tableNames.users,
    uploadLeasesTableName: deps.tableNames.uploadLeases,
    userId,
    artifactId,
    sizeMb: lease.sizeMb,
    expiresAtEpoch: addDaysEpoch(deps.tempUploadLifecycleDays),
  });
};
