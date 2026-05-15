import { z } from "zod";
import { nonEmptyStringSchema } from "./common";
import { publishModeSchema } from "./posts";

export const linkedInPayloadMediaNoneSchema = z.object({
  type: z.literal("none"),
});

export const linkedInPayloadMediaImagesSchema = z.object({
  type: z.literal("images"),
  images: z.array(
    z.object({
      s3Key: nonEmptyStringSchema,
      altText: nonEmptyStringSchema.optional(),
    }),
  ),
});

export const linkedInPayloadMediaPdfSchema = z.object({
  type: z.literal("pdf"),
  pdf: z.object({
    s3Key: nonEmptyStringSchema,
    title: nonEmptyStringSchema.optional(),
  }),
});

export const linkedInPayloadMediaSchema = z.discriminatedUnion("type", [
  linkedInPayloadMediaNoneSchema,
  linkedInPayloadMediaImagesSchema,
  linkedInPayloadMediaPdfSchema,
]);

export const linkedInPublishPayloadSchema = z.object({
  version: z.literal(1),
  provider: z.literal("linkedin"),
  mode: publishModeSchema,
  normalizedContent: z.string(),
  media: linkedInPayloadMediaSchema,
});

export type LinkedInPublishPayload = z.infer<typeof linkedInPublishPayloadSchema>;
