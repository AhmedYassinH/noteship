import { postResponseSchema, updatePostDraftSchema } from "@noteship/domain";
import { savePostDraft } from "../../use-cases/posts";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const postId = requirePathParam(event, "postId");
  const payload = parseJsonBody<Record<string, unknown>>(event.body);
  const input = updatePostDraftSchema.parse({ ...payload, postId });

  const post = await savePostDraft(deps, userId, postId, {
    content: input.content,
    mode: input.mode,
  });
  return jsonResponse(200, postResponseSchema.parse(post));
});
