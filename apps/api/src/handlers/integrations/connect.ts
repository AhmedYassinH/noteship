import { connectIntegrationSchema } from "@noteship/domain";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";
import { startIntegration } from "../../use-cases/integrations";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const provider = requirePathParam(event, "provider");
  const payload = parseJsonBody(event.body);
  const input = connectIntegrationSchema.parse(payload);

  const result = await startIntegration(deps, userId, {
    provider: provider as "linkedin",
    redirectUrl: input.redirectUrl,
  });

  return jsonResponse(200, result);
});
