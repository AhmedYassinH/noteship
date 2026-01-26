import {
  FEATURE_KEYS,
  PLANS,
  type FeatureKey,
  type PlanConfig,
  type PlanId,
} from "@noteship/domain";
import { getUserById } from "../adapters/dynamodb/users";
import { getUsageByPeriod, incrementUsage } from "../adapters/dynamodb/usage";
import type { Deps } from "../runtime/deps";
import { badRequest, forbidden, notFound } from "../runtime/errors";

const resolvePlan = (planId?: string): PlanConfig => {
  const normalized = planId === "pro" ? "pro" : "free";
  return PLANS[normalized as PlanId];
};

const getEntitlement = (plan: PlanConfig, featureKey: FeatureKey) =>
  plan.entitlements.find((entitlement) => entitlement.featureKey === featureKey);

const startOfMonthIso = (date: Date): string => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return start.toISOString();
};

export const getUsagePeriodStart = (user: { currentPeriodStart?: string }): string =>
  user.currentPeriodStart ?? startOfMonthIso(new Date());

export const resolvePlanForUser = (user: { planId?: string }): PlanConfig =>
  resolvePlan(user.planId);

export const requireUser = async (deps: Deps, userId: string) => {
  const user = await getUserById(deps.ddb, deps.tableNames.users, userId);
  if (!user) {
    throw notFound("User not found");
  }
  return user;
};

export const assertBooleanEntitlement = (plan: PlanConfig, featureKey: FeatureKey): void => {
  const entitlement = getEntitlement(plan, featureKey);
  if (!entitlement || entitlement.type !== "boolean" || entitlement.limit !== true) {
    throw forbidden("Feature not available on current plan");
  }
};

export const assertQuotaEntitlement = async (
  deps: Deps,
  userId: string,
  featureKey: FeatureKey,
  field: "aiGenerationsUsed" | "scheduledPostsUsed",
): Promise<{ periodStart: string }> => {
  const user = await requireUser(deps, userId);
  const plan = resolvePlan(user.planId);
  const entitlement = getEntitlement(plan, featureKey);
  if (!entitlement || entitlement.type !== "quota") {
    throw forbidden("Quota not available on current plan");
  }

  const periodStart = getUsagePeriodStart(user);
  const usage = await getUsageByPeriod(deps.ddb, deps.tableNames.usage, userId, periodStart);
  const used = usage?.[field] ?? 0;

  if (used >= entitlement.limit) {
    throw forbidden("Quota exceeded");
  }

  return { periodStart };
};

export const assertCapacityEntitlement = async (
  deps: Deps,
  userId: string,
  featureKey: FeatureKey,
  field: "storageUsedMb",
  delta: number,
): Promise<{ periodStart: string; used: number; limit: number }> => {
  if (delta <= 0) {
    throw badRequest("Delta must be greater than zero");
  }

  const user = await requireUser(deps, userId);
  const plan = resolvePlan(user.planId);
  const entitlement = getEntitlement(plan, featureKey);
  if (!entitlement || entitlement.type !== "capacity") {
    throw forbidden("Capacity not available on current plan");
  }

  const periodStart = getUsagePeriodStart(user);
  const usage = await getUsageByPeriod(deps.ddb, deps.tableNames.usage, userId, periodStart);
  const used = usage?.[field] ?? 0;

  if (used + delta > entitlement.limit) {
    throw forbidden("Capacity exceeded");
  }

  return { periodStart, used, limit: entitlement.limit };
};

export const incrementUsageForField = async (
  deps: Deps,
  userId: string,
  periodStart: string,
  field: "aiGenerationsUsed" | "scheduledPostsUsed" | "postsPublished" | "storageUsedMb",
): Promise<void> => {
  await incrementUsage(deps.ddb, deps.tableNames.usage, userId, periodStart, {
    [field]: 1,
  });
};

export const incrementUsageByAmount = async (
  deps: Deps,
  userId: string,
  periodStart: string,
  field: "storageUsedMb",
  amount: number,
): Promise<void> => {
  if (amount <= 0) {
    throw badRequest("Amount must be greater than zero");
  }

  await incrementUsage(deps.ddb, deps.tableNames.usage, userId, periodStart, {
    [field]: amount,
  });
};

export const getPlanForUser = async (deps: Deps, userId: string): Promise<PlanConfig> => {
  const user = await requireUser(deps, userId);
  return resolvePlan(user.planId);
};

export const resolvePlanIdFromPriceId = (
  priceId: string,
  priceMap: { proMonthly?: string; proYearly?: string },
): PlanId => {
  if (priceId === priceMap.proMonthly || priceId === priceMap.proYearly) {
    return "pro";
  }

  return "free";
};

export const getStripePriceMap = (deps: Deps) => deps.stripePriceMap;

export { FEATURE_KEYS };
