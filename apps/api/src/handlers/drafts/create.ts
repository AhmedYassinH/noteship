import { draftCreateRequestSchema } from "@noteship/domain";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";
import { generateDrafts } from "../../use-cases/drafts";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const noteId = requirePathParam(event, "noteId");
  const payload = parseJsonBody(event.body);
  const input = draftCreateRequestSchema.parse(payload);

  const result = await generateDrafts(deps, userId, noteId, input);

  return jsonResponse(200, {
    drafts: result.drafts.map((draft) => ({
      postId: draft.post.postId,
      provider: draft.post.provider,
      content: draft.content,
    })),
  });
});
