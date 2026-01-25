import { portalSessionRequestSchema } from "@noteship/domain";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { getUserId } from "../../runtime/auth";
import { createPortalSession } from "../../use-cases/billing";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const payload = parseJsonBody(event.body);
  const input = portalSessionRequestSchema.parse(payload);
  const result = await createPortalSession(deps, userId, input);
  return jsonResponse(200, result);
});
