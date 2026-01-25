import { z } from "zod";

export const errorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1),
});

export type ErrorResponse = z.infer<typeof errorSchema>;
