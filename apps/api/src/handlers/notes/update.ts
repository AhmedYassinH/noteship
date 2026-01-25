import { noteResponseSchema, noteUpdateSchema } from "@noteship/domain";
import { updateNote } from "../../use-cases/notes";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const noteId = requirePathParam(event, "noteId");
  const payload = parseJsonBody(event.body);
  const input = noteUpdateSchema.parse(payload);

  const note = await updateNote(deps, userId, noteId, input);
  return jsonResponse(200, noteResponseSchema.parse(note));
});
