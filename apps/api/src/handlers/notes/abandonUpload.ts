import { noteUploadLifecycleResponseSchema } from "@noteship/domain";
import { abandonNoteUpload } from "../../use-cases/notes";
import { getUserId } from "../../runtime/auth";
import { jsonResponse } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const noteId = requirePathParam(event, "noteId");
  const artifactId = requirePathParam(event, "artifactId");

  await abandonNoteUpload(deps, userId, noteId, artifactId);
  return jsonResponse(200, noteUploadLifecycleResponseSchema.parse({ ok: true }));
});
