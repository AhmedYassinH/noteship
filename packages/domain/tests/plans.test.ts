import { describe, expect, it } from "vitest";
import { DEFAULT_PLAN_ID, FEATURE_KEYS, PLANS, resolveEffectivePlanId } from "../src";

describe("plan resolution", () => {
  it("defaults missing users to free", () => {
    expect(resolveEffectivePlanId({})).toBe(DEFAULT_PLAN_ID);
  });

  it("requires an active or trialing subscription for pro access", () => {
    expect(resolveEffectivePlanId({ planId: "pro", subscriptionStatus: "active" })).toBe("pro");
    expect(resolveEffectivePlanId({ planId: "pro", subscriptionStatus: "trialing" })).toBe("pro");
    expect(resolveEffectivePlanId({ planId: "pro", subscriptionStatus: "canceled" })).toBe("free");
    expect(resolveEffectivePlanId({ planId: "pro", subscriptionStatus: "past_due" })).toBe("free");
  });

  it("keeps conservative free launch rate limits in plan config", () => {
    expect(PLANS.free.rateLimits).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          featureKey: FEATURE_KEYS.apiRequestsPerMinute,
          limit: 60,
          window: "minute",
        }),
        expect.objectContaining({
          featureKey: FEATURE_KEYS.apiRequestsPerDay,
          limit: 1000,
          window: "day",
        }),
        expect.objectContaining({
          featureKey: FEATURE_KEYS.searchQueriesPerHour,
          limit: 30,
          window: "hour",
        }),
      ]),
    );
  });
});
