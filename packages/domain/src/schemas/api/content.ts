import { z } from "zod";

export const contentSessionResponseSchema = z.object({
  ok: z.literal(true),
});
