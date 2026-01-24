export const FEATURE_KEYS = {
  scheduledPublish: "scheduled_publish",
  aiGenerationsPerMonth: "ai_generations_per_month",
  maxNotes: "max_notes",
  maxStorageMb: "max_storage_mb",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];
