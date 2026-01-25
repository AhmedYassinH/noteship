import { z } from "zod";
import { idSchema, nonEmptyStringSchema } from "../common";
import { postProviderSchema } from "../posts";

export const draftCreateRequestSchema = z.object({
  provider: postProviderSchema,
  tone: nonEmptyStringSchema.optional(),
  language: z.enum(["en", "ar"]).optional(),
});

export const draftResponseSchema = z.object({
  postId: idSchema,
  provider: postProviderSchema,
  content: nonEmptyStringSchema,
});

export const draftCreateResponseSchema = z.object({
  drafts: z.array(draftResponseSchema),
});
