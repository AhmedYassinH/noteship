import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const embeddingStatusSchema = z.enum(["pending", "ready", "failed"]);
export const editorFormatSchema = z.enum(["tiptap", "markdown"]);

export const noteSchema = z.object({
  userId: idSchema,
  noteId: idSchema,
  title: nonEmptyStringSchema,
  tags: z.array(z.string().min(1)).default([]),
  s3Key: nonEmptyStringSchema,
  contentHash: nonEmptyStringSchema,
  embeddingStatus: embeddingStatusSchema,
  embeddingVersion: nonEmptyStringSchema.optional(),
  editorFormat: editorFormatSchema.optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export type Note = z.infer<typeof noteSchema>;
export const noteItemSchema = noteSchema;
export type NoteItem = z.infer<typeof noteItemSchema>;

export const toNoteItem = (input: Note): NoteItem => noteSchema.parse(input);
export const fromNoteItem = (input: unknown): Note => noteSchema.parse(input);
