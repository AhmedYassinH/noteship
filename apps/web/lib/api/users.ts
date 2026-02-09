import type { MeResponse } from "@noteship/domain";
import { apiFetch } from "./client";

type Language = "en" | "ar";

export const updateMeSettings = (language: Language) =>
  apiFetch<MeResponse>("/me/settings", {
    method: "PUT",
    body: JSON.stringify({ language }),
  });
