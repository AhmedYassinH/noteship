import { z } from "zod";
import { idSchema, isoDateTimeSchema, nonEmptyStringSchema } from "../common";

export const searchRequestSchema = z.object({
  query: nonEmptyStringSchema,
  limit: z.number().int().positive().max(50).optional(),
});

export const searchResultSchema = z.object({
  noteId: idSchema,
  title: nonEmptyStringSchema,
  score: z.number(),
  preview: nonEmptyStringSchema.optional(),
  highlights: z.array(z.object({ chunkIndex: z.number().int().nonnegative() })).optional(),
  updatedAt: isoDateTimeSchema.optional(),
});

export const searchResponseSchema = z.object({
  results: z.array(searchResultSchema),
});
