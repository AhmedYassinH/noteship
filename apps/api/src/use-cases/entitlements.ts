import { FEATURE_KEYS, type PlanId } from "@noteship/domain";
import { getUserById } from "../adapters/dynamodb/users";
import { incrementUsage } from "../adapters/dynamodb/usage";
import type { Deps } from "../runtime/deps";
import { notFound } from "../runtime/errors";

const startOfMonthIso = (date: Date): string => {
  const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  return start.toISOString();
};

export const getUsagePeriodStart = (user: { currentPeriodStart?: string }): string =>
  user.currentPeriodStart ?? startOfMonthIso(new Date());

export const requireUser = async (deps: Deps, userId: string) => {
  const user = await getUserById(deps.ddb, deps.tableNames.users, userId);
  if (!user) {
    throw notFound("User not found");
  }
  return user;
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
