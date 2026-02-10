import { postResponseSchema, publishPostSchema } from "@noteship/domain";
import { publishPostNow } from "../../use-cases/posts";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";
import { logger } from "../../runtime/logger";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const postId = requirePathParam(event, "postId");
  const payload = event.body ? parseJsonBody<Record<string, unknown>>(event.body) : {};
  const input = publishPostSchema.parse({ ...payload, postId });

  const post = await publishPostNow(deps, userId, postId, { mode: input.mode });
  logger.info("post_publish_requested", {
    postId: post.postId,
    provider: post.provider,
    mode: post.publishMode,
    userId,
  });
  return jsonResponse(200, postResponseSchema.parse(post));
});
