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
  const state = event.queryStringParameters?.state;
  const redirectUrl = event.queryStringParameters?.redirectUrl;

  if (!code) {
    throw badRequest("Missing OAuth code");
  }
  if (!state) {
    throw badRequest("Missing OAuth state");
  }

  const account = await handleIntegrationCallback(deps, userId, {
    provider: provider as "linkedin",
    code,
    state,
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
