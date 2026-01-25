import { noteUploadRequestSchema, noteUploadResponseSchema } from "@noteship/domain";
import { createNoteUploadUrl } from "../../use-cases/notes";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const noteId = requirePathParam(event, "noteId");
  const payload = parseJsonBody(event.body);
  const input = noteUploadRequestSchema.parse(payload);

  const result = await createNoteUploadUrl(deps, userId, noteId, input.filename, input.contentType);

  return jsonResponse(200, noteUploadResponseSchema.parse(result));
});
