import { describe, expect, it, vi } from "vitest";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { Deps } from "../src/runtime/deps";
import { createCheckoutSession, handleStripeWebhook } from "../src/use-cases/billing";

const baseDeps = {
  tableNames: {
    users: "Users",
    notes: "Notes",
    posts: "Posts",
    integrations: "Integrations",
    usage: "Usage",
    jobs: "Jobs",
    rateLimits: "RateLimits",
    uploadLeases: "UploadLeases",
  },
  stripeWebhookSecret: "whsec_test",
  stripePriceMap: {
    proMonthly: "price_pro_monthly",
    proYearly: "price_pro_yearly",
  },
} as const;

describe("billing", () => {
  it("blocks checkout while billing is disabled", async () => {
    const deps = {
      ...baseDeps,
      billingEnabled: false,
      ddb: { send: vi.fn() } as unknown as DynamoDBDocumentClient,
      stripe: {},
    } as Deps;

    await expect(
      createCheckoutSession(deps, "u1", {
        priceId: "price_pro_monthly",
        successUrl: "https://noteship.test/success",
        cancelUrl: "https://noteship.test/cancel",
      }),
    ).rejects.toMatchObject({ code: "BILLING_DISABLED" });
  });

  it("downgrades inactive Stripe subscriptions to free", async () => {
    let putItem: Record<string, unknown> | undefined;
    const deps = {
      ...baseDeps,
      billingEnabled: true,
      ddb: {
        send: vi.fn(async (command) => {
          if (command.constructor.name === "GetCommand") {
            return {
              Item: {
                userId: "u1",
                email: "user@example.com",
                createdAt: "2026-01-01T00:00:00.000Z",
                planId: "pro",
                subscriptionStatus: "active",
              },
            };
          }
          putItem = command.input.Item;
          return {};
        }),
      } as unknown as DynamoDBDocumentClient,
      stripe: {
        webhooks: {
          constructEvent: vi.fn(() => ({
            type: "customer.subscription.deleted",
            data: {
              object: {
                id: "sub_123",
                customer: "cus_123",
                metadata: { userId: "u1" },
                status: "canceled",
                current_period_start: 1767225600,
                current_period_end: 1769904000,
                items: { data: [{ price: { id: "price_pro_monthly" } }] },
              },
            },
          })),
        },
      },
    } as unknown as Deps;

    await handleStripeWebhook(deps, "{}", "sig_test");

    expect(putItem).toMatchObject({
      userId: "u1",
      planId: "free",
      subscriptionStatus: "canceled",
      subscriptionId: "sub_123",
      priceId: "price_pro_monthly",
    });
  });
});
