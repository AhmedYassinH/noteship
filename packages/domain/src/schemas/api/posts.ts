import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "../common";
import { publishModeSchema } from "../posts";

export const apiPostProviderSchema = z.enum(["linkedin", "medium"]);
export const apiPostStatusSchema = z.enum([
  "draft",
  "queued",
  "scheduled",
  "publishing",
  "published",
  "failed",
]);

export const createPostSchema = z.object({
  noteId: idSchema,
  provider: apiPostProviderSchema,
  content: nonEmptyStringSchema.optional(),
});

export const publishPostSchema = z.object({
  postId: idSchema,
  mode: publishModeSchema.optional(),
});

export const schedulePostSchema = z.object({
  postId: idSchema,
  scheduledAt: isoDateTimeSchema,
  timezone: nonEmptyStringSchema.optional(),
  mode: publishModeSchema.optional(),
});

export const updatePostDraftSchema = z.object({
  postId: idSchema,
  content: nonEmptyStringSchema,
  mode: publishModeSchema.optional(),
});

export const cancelPostSchema = z.object({
  postId: idSchema,
});

export const listPostsQuerySchema = z.object({
  status: apiPostStatusSchema.optional(),
  cursor: nonEmptyStringSchema.optional(),
  limit: z.number().int().positive().max(100).optional(),
});

export const postResponseSchema = z.object({
  postId: idSchema,
  noteId: idSchema,
  provider: apiPostProviderSchema,
  publishMode: publishModeSchema.optional(),
  status: apiPostStatusSchema,
  scheduledAt: isoDateTimeSchema.optional(),
  scheduledTimezone: nonEmptyStringSchema.optional(),
  publishedAt: isoDateTimeSchema.optional(),
  contentS3Key: nonEmptyStringSchema.optional(),
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export const postListResponseSchema = z.object({
  items: z.array(postResponseSchema),
  nextCursor: nonEmptyStringSchema.optional(),
});
