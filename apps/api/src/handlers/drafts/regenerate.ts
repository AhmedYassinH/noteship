import { draftRegenerateRequestSchema, draftRegenerateResponseSchema } from "@noteship/domain";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";
import { regenerateDraft } from "../../use-cases/drafts";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const noteId = requirePathParam(event, "noteId");
  const payload = parseJsonBody(event.body);
  const input = draftRegenerateRequestSchema.parse(payload);

  const result = await regenerateDraft(deps, userId, noteId, input);
  return jsonResponse(200, draftRegenerateResponseSchema.parse(result));
});
