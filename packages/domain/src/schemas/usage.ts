import { z } from "zod";
import { idSchema, isoDateTimeSchema } from "./common";

export const usageSchema = z.object({
  userId: idSchema,
  periodStart: isoDateTimeSchema,
  aiGenerationsUsed: z.number().int().nonnegative(),
  scheduledPostsUsed: z.number().int().nonnegative(),
  postsPublished: z.number().int().nonnegative().optional(),
  storageUsedMb: z.number().nonnegative().optional(),
  updatedAt: isoDateTimeSchema.optional(),
});

export type Usage = z.infer<typeof usageSchema>;
export const usageItemSchema = usageSchema;
export type UsageItem = z.infer<typeof usageItemSchema>;

export const toUsageItem = (input: Usage): UsageItem => usageSchema.parse(input);
export const fromUsageItem = (input: unknown): Usage => usageSchema.parse(input);
