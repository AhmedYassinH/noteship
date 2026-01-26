import { FEATURE_KEYS, PLANS, type PlanConfig, type PlanId } from "@noteship/domain";

export type EntitlementsSnapshot = {
  planId: PlanId;
  plan: PlanConfig;
  canSchedule: boolean;
  maxNotes: number;
  maxStorageMb: number;
  aiGenerationsPerMonth: number;
};

const resolvePlanId = (planId?: string): PlanId => (planId === "pro" ? "pro" : "free");

const getLimit = (plan: PlanConfig, featureKey: string, fallback = 0): number => {
  const entitlement = plan.entitlements.find((item) => item.featureKey === featureKey);
  if (!entitlement || entitlement.type === "boolean") {
    return fallback;
  }
  return entitlement.limit;
};

export const getEntitlements = (planId?: string): EntitlementsSnapshot => {
  const resolvedPlanId = resolvePlanId(planId);
  const plan = PLANS[resolvedPlanId];
  const scheduled = plan.entitlements.find(
    (item) => item.featureKey === FEATURE_KEYS.scheduledPublish,
  );

  return {
    planId: resolvedPlanId,
    plan,
    canSchedule: scheduled?.type === "boolean" ? scheduled.limit === true : false,
    maxNotes: getLimit(plan, FEATURE_KEYS.maxNotes),
    maxStorageMb: getLimit(plan, FEATURE_KEYS.maxStorageMb),
    aiGenerationsPerMonth: getLimit(plan, FEATURE_KEYS.aiGenerationsPerMonth),
  };
};
