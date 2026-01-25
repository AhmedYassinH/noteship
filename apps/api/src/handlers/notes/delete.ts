import { deleteNoteById } from "../../use-cases/notes";
import { getUserId } from "../../runtime/auth";
import { jsonResponse } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const noteId = requirePathParam(event, "noteId");

  await deleteNoteById(deps, userId, noteId);
  return jsonResponse(204, null);
});
