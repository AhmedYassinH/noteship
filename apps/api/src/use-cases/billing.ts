import type Stripe from "stripe";
import type { Deps } from "../runtime/deps";
import { badRequest, notFound } from "../runtime/errors";
import { getUserById, putUser } from "../adapters/dynamodb/users";
import { resolvePlanIdFromPriceId } from "./entitlements";

const toIso = (seconds: number | null | undefined): string | undefined =>
  typeof seconds === "number" ? new Date(seconds * 1000).toISOString() : undefined;

const getUserOrThrow = async (deps: Deps, userId: string) => {
  const user = await getUserById(deps.ddb, deps.tableNames.users, userId);
  if (!user) {
    throw notFound("User not found");
  }
  return user;
};

export const createCheckoutSession = async (
  deps: Deps,
  userId: string,
  input: {
    priceId: string;
    successUrl: string;
    cancelUrl: string;
  },
): Promise<{ url: string }> => {
  const user = await getUserOrThrow(deps, userId);

  const session = await deps.stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: input.priceId, quantity: 1 }],
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer: user.stripeCustomerId,
    client_reference_id: userId,
    metadata: { userId },
    subscription_data: {
      metadata: { userId },
    },
  });

  if (!session.url) {
    throw badRequest("Stripe session missing URL");
  }

  return { url: session.url };
};

export const createPortalSession = async (
  deps: Deps,
  userId: string,
  input: { returnUrl: string },
): Promise<{ url: string }> => {
  const user = await getUserOrThrow(deps, userId);

  if (!user.stripeCustomerId) {
    throw badRequest("Customer is not linked to Stripe");
  }

  const session = await deps.stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: input.returnUrl,
  });

  return { url: session.url };
};

const updateUserFromSubscription = async (
  deps: Deps,
  input: {
    userId: string;
    customerId: string | null;
    status: string | null;
    currentPeriodStart?: number | null;
    currentPeriodEnd?: number | null;
    priceId?: string | null;
  },
): Promise<void> => {
  const user = await getUserOrThrow(deps, input.userId);
  const planId = input.priceId
    ? resolvePlanIdFromPriceId(input.priceId, deps.stripePriceMap)
    : "free";

  await putUser(deps.ddb, deps.tableNames.users, {
    ...user,
    planId,
    stripeCustomerId: input.customerId ?? user.stripeCustomerId,
    subscriptionStatus: input.status ?? user.subscriptionStatus,
    currentPeriodStart: toIso(input.currentPeriodStart) ?? user.currentPeriodStart,
    currentPeriodEnd: toIso(input.currentPeriodEnd) ?? user.currentPeriodEnd,
  });
};

const handleSubscriptionEvent = async (
  deps: Deps,
  subscription: Stripe.Subscription,
): Promise<void> => {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    throw badRequest("Subscription missing user metadata");
  }

  const priceId = subscription.items.data[0]?.price?.id;
  await updateUserFromSubscription(deps, {
    userId,
    customerId: typeof subscription.customer === "string" ? subscription.customer : null,
    status: subscription.status,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    priceId: priceId ?? undefined,
  });
};

export const handleStripeWebhook = async (
  deps: Deps,
  payload: string,
  signature: string | undefined,
): Promise<{ received: boolean; eventType?: string }> => {
  if (!signature) {
    throw badRequest("Missing Stripe signature");
  }

  const event = deps.stripe.webhooks.constructEvent(payload, signature, deps.stripeWebhookSecret);
  const eventType = event.type;

  switch (eventType) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId || session.client_reference_id;
      if (!userId || !session.subscription) {
        break;
      }

      const subscription = await deps.stripe.subscriptions.retrieve(session.subscription as string);
      await handleSubscriptionEvent(deps, subscription);
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await handleSubscriptionEvent(deps, subscription);
      break;
    }
    default:
      break;
  }

  return { received: true, eventType };
};
