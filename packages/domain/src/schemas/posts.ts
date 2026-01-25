import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const postProviderSchema = z.enum(["linkedin", "medium"]);
export const postStatusSchema = z.enum([
  "draft",
  "queued",
  "scheduled",
  "publishing",
  "published",
  "failed",
]);

const postErrorSchema = z
  .object({
    code: nonEmptyStringSchema,
    message: nonEmptyStringSchema,
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "error must have fields")
  .optional();

export const postSchema = z.object({
  userId: idSchema,
  postId: idSchema,
  noteId: idSchema,
  provider: postProviderSchema,
  status: postStatusSchema,
  scheduledAt: isoDateTimeSchema.optional(),
  publishedAt: isoDateTimeSchema.optional(),
  contentS3Key: nonEmptyStringSchema.optional(),
  error: postErrorSchema,
  createdAt: isoDateTimeSchema,
  updatedAt: isoDateTimeSchema,
});

export type Post = z.infer<typeof postSchema>;

export const postItemSchema = postSchema.extend({
  statusUpdatedAt: nonEmptyStringSchema,
  scheduleStatus: z.literal("scheduled").optional(),
});

export type PostItem = z.infer<typeof postItemSchema>;

export const buildStatusUpdatedAt = (status: Post["status"], updatedAt: string): string =>
  `${status}#${updatedAt}`;

export const buildScheduleStatus = (status: Post["status"]): "scheduled" | undefined =>
  status === "scheduled" ? "scheduled" : undefined;

export const toPostItem = (input: Post): PostItem => {
  const post = postSchema.parse(input);

  return postItemSchema.parse({
    ...post,
    statusUpdatedAt: buildStatusUpdatedAt(post.status, post.updatedAt),
    scheduleStatus: buildScheduleStatus(post.status),
  });
};

export const fromPostItem = (input: unknown): Post => {
  const {
    statusUpdatedAt: _statusUpdatedAt,
    scheduleStatus: _scheduleStatus,
    ...post
  } = postItemSchema.parse(input);

  return post;
};
