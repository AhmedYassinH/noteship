import { disconnectIntegrationSchema } from "@noteship/domain";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";
import { disconnectIntegration } from "../../use-cases/integrations";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const provider = requirePathParam(event, "provider");
  const payload = event.body ? parseJsonBody(event.body) : {};
  disconnectIntegrationSchema.parse(payload);

  const result = await disconnectIntegration(deps, userId, {
    provider: provider as "linkedin" | "medium",
  });

  return jsonResponse(200, { items: result.items });
});
