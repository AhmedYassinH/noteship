import { jsonResponse } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { logger } from "../../runtime/logger";
import { handleStripeWebhook } from "../../use-cases/billing";

export const handler = withDeps(async (deps, event) => {
  const rawBody = event.body ?? "";
  const payload = event.isBase64Encoded ? Buffer.from(rawBody, "base64").toString("utf8") : rawBody;
  const signature = event.headers["stripe-signature"] ?? event.headers["Stripe-Signature"];

  const result = await handleStripeWebhook(deps, payload, signature);
  if (result.eventType) {
    logger.info("stripe_webhook_received", { eventType: result.eventType });
  }
  return jsonResponse(200, { received: true });
});
