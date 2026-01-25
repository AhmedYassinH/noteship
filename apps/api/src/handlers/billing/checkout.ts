import { checkoutSessionRequestSchema } from "@noteship/domain";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { getUserId } from "../../runtime/auth";
import { createCheckoutSession } from "../../use-cases/billing";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const payload = parseJsonBody(event.body);
  const input = checkoutSessionRequestSchema.parse(payload);
  const result = await createCheckoutSession(deps, userId, input);
  return jsonResponse(200, result);
});
