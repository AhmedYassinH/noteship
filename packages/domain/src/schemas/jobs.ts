import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const jobTypeSchema = z.enum(["EMBED_NOTE", "PUBLISH_POST", "IMPORT_NOTE"]);
export const jobStatusSchema = z.enum(["queued", "running", "succeeded", "failed"]);

export const jobSchema = z.object({
  userId: idSchema,
  jobId: idSchema,
  type: jobTypeSchema,
  status: jobStatusSchema,
  payload: z.record(z.string(), z.unknown()).optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema.optional(),
});

export const embedNoteJobPayloadSchema = z.object({
  noteId: idSchema,
  s3Key: nonEmptyStringSchema,
  version: nonEmptyStringSchema,
});

export const publishPostJobPayloadSchema = z.object({
  postId: idSchema,
});

export const jobMessageSchema = z.object({
  jobId: idSchema,
  type: jobTypeSchema,
  userId: idSchema,
  createdAt: isoDateTimeSchema,
  payload: z.record(z.string(), z.unknown()),
});

export type EmbedNoteJobPayload = z.infer<typeof embedNoteJobPayloadSchema>;
export type PublishPostJobPayload = z.infer<typeof publishPostJobPayloadSchema>;
export type JobMessage = z.infer<typeof jobMessageSchema>;

export type Job = z.infer<typeof jobSchema>;
export const jobItemSchema = jobSchema;
export type JobItem = z.infer<typeof jobItemSchema>;

export const toJobItem = (input: Job): JobItem => jobSchema.parse(input);
export const fromJobItem = (input: unknown): Job => jobSchema.parse(input);
