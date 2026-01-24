import type { FeatureKey } from "./features";

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

export type PlanConfig = {
  planId: PlanId;
  name: string;
  entitlements: PlanEntitlement[];
};

export const PLANS: Record<PlanId, PlanConfig> = {
  free: {
    planId: "free",
    name: "Free",
    entitlements: [
      { featureKey: "scheduled_publish", type: "boolean", limit: false },
      { featureKey: "ai_generations_per_month", type: "quota", limit: 20 },
      { featureKey: "max_notes", type: "capacity", limit: 50 },
      { featureKey: "max_storage_mb", type: "capacity", limit: 250 },
    ],
  },
  pro: {
    planId: "pro",
    name: "Pro",
    entitlements: [
      { featureKey: "scheduled_publish", type: "boolean", limit: true },
      { featureKey: "ai_generations_per_month", type: "quota", limit: 200 },
      { featureKey: "max_notes", type: "capacity", limit: 2000 },
      { featureKey: "max_storage_mb", type: "capacity", limit: 5000 },
    ],
  },
};
