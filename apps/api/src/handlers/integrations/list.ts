import { getUserId } from "../../runtime/auth";
import { withDeps } from "../../runtime/handler";
import { jsonResponse } from "../../runtime/http";
import { listIntegrations } from "../../use-cases/integrations";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const result = await listIntegrations(deps, userId);

  return jsonResponse(200, {
    items: result.items.map((item) => ({
      provider: item.provider,
      accountId: item.accountId,
      status: item.status,
      scopes: item.scopes,
      connectedAt: item.connectedAt,
      updatedAt: item.updatedAt,
    })),
  });
});
