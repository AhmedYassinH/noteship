import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "./common";

export const rateLimitSchema = z.object({
  userId: idSchema,
  bucketKey: nonEmptyStringSchema,
  count: z.number().int().nonnegative(),
  expiresAtEpoch: z.number().int().positive(),
  updatedAt: isoDateTimeSchema,
});

export type RateLimit = z.infer<typeof rateLimitSchema>;
export const rateLimitItemSchema = rateLimitSchema;
export type RateLimitItem = z.infer<typeof rateLimitItemSchema>;

export const toRateLimitItem = (input: RateLimit): RateLimitItem => rateLimitSchema.parse(input);
export const fromRateLimitItem = (input: unknown): RateLimit => rateLimitSchema.parse(input);
