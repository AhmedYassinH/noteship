import {
  FEATURE_KEYS,
  getPlanEntitlement,
  getPlanRateLimit,
  resolveEffectivePlan,
  type FeatureKey,
  type PlanConfig,
} from "@noteship/domain";
import { consumeRateLimit } from "../adapters/dynamodb/rate-limits";
import { getUserById, incrementUserCounter } from "../adapters/dynamodb/users";
import {
  commitAiGenerationReservation,
  releaseAiGenerationReservation,
  reserveAiGeneration,
} from "../adapters/dynamodb/usage";
import { featureNotAvailable, planLimitExceeded, rateLimited } from "../runtime/errors";
import type { Deps } from "../runtime/deps";
import { getUsagePeriodStart } from "./entitlements";

export type PolicyAction =
  | "api.request"
  | "note.create"
  | "note.upload"
  | "search.query"
  | "draft.generate"
  | "post.publish"
  | "post.schedule"
  | "integration.connect"
  | "billing.open";

type PolicyResult = {
  ok: boolean;
  code?: "FEATURE_NOT_AVAILABLE" | "PLAN_LIMIT_EXCEEDED" | "RATE_LIMITED";
  message?: string;
};

type AiReservation = {
  periodStart: string;
  commit: () => Promise<void>;
  release: () => Promise<void>;
};

const rateLimitFeaturesByAction: Partial<Record<PolicyAction, FeatureKey[]>> = {
  "api.request": [FEATURE_KEYS.apiRequestsPerMinute, FEATURE_KEYS.apiRequestsPerDay],
  "note.upload": [FEATURE_KEYS.uploadSessionsPerDay],
  "search.query": [FEATURE_KEYS.searchQueriesPerHour],
  "draft.generate": [FEATURE_KEYS.aiGenerationsPerHour],
  "post.publish": [FEATURE_KEYS.publishRequestsPerDay],
  "integration.connect": [FEATURE_KEYS.publishRequestsPerDay],
};

const getLimit = (plan: PlanConfig, featureKey: FeatureKey, type: "quota" | "capacity") => {
  const entitlement = getPlanEntitlement(plan, featureKey);
  if (!entitlement || entitlement.type !== type) {
    return undefined;
  }
  return entitlement.limit;
};

const getBoolean = (plan: PlanConfig, featureKey: FeatureKey): boolean => {
  const entitlement = getPlanEntitlement(plan, featureKey);
  return entitlement?.type === "boolean" && entitlement.limit === true;
};

const resolvePlanForPolicy = async (deps: Deps, userId: string): Promise<PlanConfig> => {
  const user = await getUserById(deps.ddb, deps.tableNames.users, userId);
  return resolveEffectivePlan(user ?? {});
};

const enforceRateLimits = async (
  deps: Deps,
  userId: string,
  plan: PlanConfig,
  action: PolicyAction,
): Promise<void> => {
  const featureKeys = rateLimitFeaturesByAction[action] ?? [];
  for (const featureKey of featureKeys) {
    const limit = getPlanRateLimit(plan, featureKey);
    if (!limit) {
      continue;
    }
    await consumeRateLimit(deps.ddb, deps.tableNames.rateLimits, {
      userId,
      key: featureKey,
      limit: limit.limit,
      window: limit.window,
    });
  }
};

export const can = async (
  deps: Deps,
  userId: string,
  action: PolicyAction,
): Promise<PolicyResult> => {
  try {
    const plan = await resolvePlanForPolicy(deps, userId);
    await enforceRateLimits(deps, userId, plan, action);

    if (action === "post.schedule" && !getBoolean(plan, FEATURE_KEYS.scheduledPublish)) {
      return {
        ok: false,
        code: "FEATURE_NOT_AVAILABLE",
        message: "Feature not available on current plan",
      };
    }

    return { ok: true };
  } catch (error) {
    if (error instanceof Error && "code" in error) {
      const code = String((error as { code?: string }).code);
      if (
        code === "RATE_LIMITED" ||
        code === "PLAN_LIMIT_EXCEEDED" ||
        code === "FEATURE_NOT_AVAILABLE"
      ) {
        return {
          ok: false,
          code: code as PolicyResult["code"],
          message: error.message,
        };
      }
    }
    throw error;
  }
};

export const assertCan = async (
  deps: Deps,
  userId: string,
  action: PolicyAction,
): Promise<void> => {
  const result = await can(deps, userId, action);
  if (result.ok) {
    return;
  }

  if (result.code === "RATE_LIMITED") {
    throw rateLimited(result.message ?? "Rate limit exceeded");
  }
  if (result.code === "FEATURE_NOT_AVAILABLE") {
    throw featureNotAvailable(result.message ?? "Feature not available on current plan");
  }
  throw planLimitExceeded(result.message ?? "Plan limit exceeded");
};

export const assertAndConsumeNoteCapacity = async (deps: Deps, userId: string): Promise<void> => {
  await assertCan(deps, userId, "note.create");
  const plan = await resolvePlanForPolicy(deps, userId);
  const limit = getLimit(plan, FEATURE_KEYS.maxNotes, "capacity");
  if (limit === undefined) {
    throw planLimitExceeded("Note capacity is not available on current plan");
  }

  await incrementUserCounter(deps.ddb, deps.tableNames.users, userId, "notesUsed", limit);
};

export const assertAndConsumeScheduleCapacity = async (
  deps: Deps,
  userId: string,
): Promise<void> => {
  await assertCan(deps, userId, "post.schedule");
  const plan = await resolvePlanForPolicy(deps, userId);
  const limit = getLimit(plan, FEATURE_KEYS.maxScheduledPosts, "capacity");
  if (limit === undefined) {
    throw planLimitExceeded("Scheduled post capacity is not available on current plan");
  }

  await incrementUserCounter(
    deps.ddb,
    deps.tableNames.users,
    userId,
    "activeScheduledPosts",
    limit,
  );
};

export const reserveAiGenerationQuota = async (
  deps: Deps,
  userId: string,
): Promise<AiReservation> => {
  await assertCan(deps, userId, "draft.generate");
  const user = await getUserById(deps.ddb, deps.tableNames.users, userId);
  const plan = resolveEffectivePlan(user ?? {});
  const limit = getLimit(plan, FEATURE_KEYS.aiGenerationsPerMonth, "quota");
  if (limit === undefined) {
    throw planLimitExceeded("AI generation quota is not available on current plan");
  }

  const periodStart = getUsagePeriodStart(user ?? {});
  await reserveAiGeneration(deps.ddb, deps.tableNames.usage, userId, periodStart, limit);

  return {
    periodStart,
    commit: () =>
      commitAiGenerationReservation(deps.ddb, deps.tableNames.usage, userId, periodStart),
    release: () =>
      releaseAiGenerationReservation(deps.ddb, deps.tableNames.usage, userId, periodStart),
  };
};

export const getStorageCapacityLimit = async (deps: Deps, userId: string): Promise<number> => {
  const plan = await resolvePlanForPolicy(deps, userId);
  const limit = getLimit(plan, FEATURE_KEYS.maxStorageMb, "capacity");
  if (limit === undefined) {
    throw planLimitExceeded("Storage capacity is not available on current plan");
  }
  return limit;
};
