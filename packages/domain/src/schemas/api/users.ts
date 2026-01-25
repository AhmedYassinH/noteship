import { z } from "zod";
import { userSchema } from "../users";

export const meResponseSchema = z.object({
  user: userSchema,
});

export type MeResponse = z.infer<typeof meResponseSchema>;
