import { noteCreateSchema, noteResponseSchema } from "@noteship/domain";
import { createNote } from "../../use-cases/notes";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const payload = parseJsonBody(event.body);
  const input = noteCreateSchema.parse(payload);

  const note = await createNote(deps, userId, input);
  return jsonResponse(201, noteResponseSchema.parse(note));
});
