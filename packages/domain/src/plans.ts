import type { FeatureKey } from "./features";
import { FEATURE_KEYS } from "./features";

export type EntitlementType = "boolean" | "quota" | "capacity";

export type BooleanEntitlement = {
  featureKey: FeatureKey;
  type: "boolean";
  limit: boolean;
};

export type QuotaEntitlement = {
  featureKey: FeatureKey;
  type: "quota";
  limit: number;
};

export type CapacityEntitlement = {
  featureKey: FeatureKey;
  type: "capacity";
  limit: number;
};

export type PlanEntitlement = BooleanEntitlement | QuotaEntitlement | CapacityEntitlement;

export type PlanId = "free" | "pro";

export type RateLimitWindow = "minute" | "hour" | "day";

export type RateLimitConfig = {
  featureKey: FeatureKey;
  limit: number;
  window: RateLimitWindow;
};

export type PlanConfig = {
  planId: PlanId;
  name: string;
  entitlements: PlanEntitlement[];
  rateLimits: RateLimitConfig[];
};

export const DEFAULT_PLAN_ID: PlanId = "free";

export const ACTIVE_SUBSCRIPTION_STATUSES = ["active", "trialing"] as const;

export type ActiveSubscriptionStatus = (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number];

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    planId: "free",
    name: "Free",
    entitlements: [
      { featureKey: FEATURE_KEYS.scheduledPublish, type: "boolean", limit: false },
      { featureKey: FEATURE_KEYS.aiGenerationsPerMonth, type: "quota", limit: 20 },
      { featureKey: FEATURE_KEYS.aiGenerationsPerHour, type: "quota", limit: 3 },
      { featureKey: FEATURE_KEYS.maxNotes, type: "capacity", limit: 50 },
      { featureKey: FEATURE_KEYS.maxScheduledPosts, type: "capacity", limit: 0 },
      { featureKey: FEATURE_KEYS.maxStorageMb, type: "capacity", limit: 250 },
    ],
    rateLimits: [
      { featureKey: FEATURE_KEYS.apiRequestsPerMinute, limit: 60, window: "minute" },
      { featureKey: FEATURE_KEYS.apiRequestsPerDay, limit: 1000, window: "day" },
      { featureKey: FEATURE_KEYS.searchQueriesPerHour, limit: 30, window: "hour" },
      { featureKey: FEATURE_KEYS.aiGenerationsPerHour, limit: 3, window: "hour" },
      { featureKey: FEATURE_KEYS.uploadSessionsPerDay, limit: 20, window: "day" },
      { featureKey: FEATURE_KEYS.publishRequestsPerDay, limit: 10, window: "day" },
    ],
  },
  pro: {
    planId: "pro",
    name: "Pro",
    entitlements: [
      { featureKey: FEATURE_KEYS.scheduledPublish, type: "boolean", limit: true },
      { featureKey: FEATURE_KEYS.aiGenerationsPerMonth, type: "quota", limit: 200 },
      { featureKey: FEATURE_KEYS.aiGenerationsPerHour, type: "quota", limit: 20 },
      { featureKey: FEATURE_KEYS.maxNotes, type: "capacity", limit: 2000 },
      { featureKey: FEATURE_KEYS.maxScheduledPosts, type: "capacity", limit: 100 },
      { featureKey: FEATURE_KEYS.maxStorageMb, type: "capacity", limit: 5000 },
    ],
    rateLimits: [
      { featureKey: FEATURE_KEYS.apiRequestsPerMinute, limit: 240, window: "minute" },
      { featureKey: FEATURE_KEYS.apiRequestsPerDay, limit: 10000, window: "day" },
      { featureKey: FEATURE_KEYS.searchQueriesPerHour, limit: 500, window: "hour" },
      { featureKey: FEATURE_KEYS.aiGenerationsPerHour, limit: 20, window: "hour" },
      { featureKey: FEATURE_KEYS.uploadSessionsPerDay, limit: 200, window: "day" },
      { featureKey: FEATURE_KEYS.publishRequestsPerDay, limit: 100, window: "day" },
    ],
  },
};

export const isActiveSubscriptionStatus = (
  status: string | null | undefined,
): status is ActiveSubscriptionStatus =>
  ACTIVE_SUBSCRIPTION_STATUSES.includes(status as ActiveSubscriptionStatus);

export const resolvePlanId = (planId?: string | null): PlanId =>
  planId === "pro" ? "pro" : DEFAULT_PLAN_ID;

export const resolveEffectivePlanId = (input: {
  planId?: string | null;
  subscriptionStatus?: string | null;
}): PlanId => {
  const planId = resolvePlanId(input.planId);
  if (planId === "pro" && !isActiveSubscriptionStatus(input.subscriptionStatus)) {
    return DEFAULT_PLAN_ID;
  }

  return planId;
};

export const resolveEffectivePlan = (input: {
  planId?: string | null;
  subscriptionStatus?: string | null;
}): PlanConfig => PLANS[resolveEffectivePlanId(input)];

export const getPlanEntitlement = (
  plan: PlanConfig,
  featureKey: FeatureKey,
): PlanEntitlement | undefined =>
  plan.entitlements.find((entitlement) => entitlement.featureKey === featureKey);

export const getPlanRateLimit = (
  plan: PlanConfig,
  featureKey: FeatureKey,
): RateLimitConfig | undefined =>
  plan.rateLimits.find((rateLimit) => rateLimit.featureKey === featureKey);
