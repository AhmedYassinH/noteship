import { z } from "zod";
import { languageSchema, userSchema } from "../users";

export const meResponseSchema = z.object({
  user: userSchema,
});

export const updateMeSettingsSchema = z.object({
  language: languageSchema,
  timezone: z.string().min(1).optional(),
});

export type MeResponse = z.infer<typeof meResponseSchema>;
export type UpdateMeSettingsRequest = z.infer<typeof updateMeSettingsSchema>;
