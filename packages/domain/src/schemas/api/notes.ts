import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "../common";

export const listNotesQuerySchema = z.object({
  cursor: nonEmptyStringSchema.optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const noteCreateSchema = z.object({
  title: z.string(),
  content: z.string(),
  tags: z.array(z.string().min(1)).optional(),
  editorFormat: z.enum(["tiptap", "markdown"]).optional(),
});

export const noteUpdateSchema = z.object({
  title: nonEmptyStringSchema.optional(),
  content: z.string().optional(),
  tags: z.array(z.string().min(1)).optional(),
  editorFormat: z.enum(["tiptap", "markdown"]).optional(),
});

export const noteUploadRequestSchema = z.object({
  filename: nonEmptyStringSchema,
  contentType: nonEmptyStringSchema,
  sizeBytes: z.number().int().positive(),
});

export const noteUploadResponseSchema = z.object({
  uploadUrl: nonEmptyStringSchema,
  s3Key: nonEmptyStringSchema,
  artifactId: nonEmptyStringSchema,
  publicUrl: nonEmptyStringSchema,
});

export const noteResponseSchema = z.object({
  noteId: idSchema,
  title: nonEmptyStringSchema,
  tags: z.array(z.string().min(1)),
  s3Key: nonEmptyStringSchema,
  contentHash: nonEmptyStringSchema,
  embeddingStatus: z.enum(["pending", "ready", "failed"]),
  embeddingVersion: nonEmptyStringSchema.optional(),
  editorFormat: z.enum(["tiptap", "markdown"]).optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const noteWithContentResponseSchema = noteResponseSchema.extend({
  content: z.string(),
});

export const noteListResponseSchema = z.object({
  items: z.array(noteResponseSchema),
  nextCursor: nonEmptyStringSchema.optional(),
});
