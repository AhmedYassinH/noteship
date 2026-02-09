import { z } from "zod";
import { languageSchema, userSchema } from "../users";

export const meResponseSchema = z.object({
  user: userSchema,
});

export const updateMeSettingsSchema = z.object({
  language: languageSchema,
});

export type MeResponse = z.infer<typeof meResponseSchema>;
export type UpdateMeSettingsRequest = z.infer<typeof updateMeSettingsSchema>;
