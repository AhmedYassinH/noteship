import { createPostSchema, postResponseSchema } from "@noteship/domain";
import { createPost } from "../../use-cases/posts";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const payload = parseJsonBody(event.body);
  const input = createPostSchema.parse(payload);

  const post = await createPost(deps, userId, input);
  return jsonResponse(201, postResponseSchema.parse(post));
});
