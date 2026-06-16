export const FEATURE_KEYS = {
  scheduledPublish: "scheduled_publish",
  aiGenerationsPerMonth: "ai_generations_per_month",
  aiGenerationsPerHour: "ai_generations_per_hour",
  maxNotes: "max_notes",
  maxScheduledPosts: "max_scheduled_posts",
  maxStorageMb: "max_storage_mb",
  apiRequestsPerMinute: "api_requests_per_minute",
  apiRequestsPerDay: "api_requests_per_day",
  searchQueriesPerHour: "search_queries_per_hour",
  uploadSessionsPerDay: "upload_sessions_per_day",
  publishRequestsPerDay: "publish_requests_per_day",
} as const;

export type FeatureKey = (typeof FEATURE_KEYS)[keyof typeof FEATURE_KEYS];
