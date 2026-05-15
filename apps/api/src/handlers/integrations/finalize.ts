import { finalizeIntegrationCallbackSchema } from "@noteship/domain";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";
import { handleIntegrationCallback } from "../../use-cases/integrations";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const provider = requirePathParam(event, "provider");
  const payload = parseJsonBody(event.body);
  const input = finalizeIntegrationCallbackSchema.parse(payload);

  const account = await handleIntegrationCallback(deps, userId, {
    provider: provider as "linkedin" | "medium",
    code: input.code,
    state: input.state,
    redirectUrl: input.redirectUrl,
  });

  return jsonResponse(200, {
    provider: account.provider,
    accountId: account.accountId,
    status: account.status,
    scopes: account.scopes,
    connectedAt: account.connectedAt,
    updatedAt: account.updatedAt,
  });
});
