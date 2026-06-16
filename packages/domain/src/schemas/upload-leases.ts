import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const uploadLeaseStatusSchema = z.enum(["reserved", "completed", "abandoned"]);

export const uploadLeaseSchema = z.object({
  userId: idSchema,
  artifactId: idSchema,
  noteId: idSchema,
  s3Key: nonEmptyStringSchema,
  finalS3Key: nonEmptyStringSchema.optional(),
  sizeBytes: z.number().int().positive(),
  sizeMb: z.number().positive(),
  status: uploadLeaseStatusSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
  expiresAt: isoDateTimeSchema,
  expiresAtEpoch: z.number().int().positive().optional(),
});

export type UploadLease = z.infer<typeof uploadLeaseSchema>;
export const uploadLeaseItemSchema = uploadLeaseSchema;
export type UploadLeaseItem = z.infer<typeof uploadLeaseItemSchema>;

export const toUploadLeaseItem = (input: UploadLease): UploadLeaseItem =>
  uploadLeaseSchema.parse(input);
export const fromUploadLeaseItem = (input: unknown): UploadLease => uploadLeaseSchema.parse(input);
