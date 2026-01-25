import { getUserId } from "../../runtime/auth";
import { jsonResponse } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";
import { badRequest } from "../../runtime/errors";
import { handleIntegrationCallback } from "../../use-cases/integrations";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const provider = requirePathParam(event, "provider");
  const code = event.queryStringParameters?.code;
  const redirectUrl = event.queryStringParameters?.redirectUrl;

  if (!code) {
    throw badRequest("Missing OAuth code");
  }

  const account = await handleIntegrationCallback(deps, userId, {
    provider: provider as "linkedin" | "medium",
    code,
    redirectUrl,
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
