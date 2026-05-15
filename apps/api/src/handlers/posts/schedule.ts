import { schedulePostSchema, postResponseSchema } from "@noteship/domain";
import { schedulePost } from "../../use-cases/posts";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { requirePathParam } from "../../runtime/params";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const postId = requirePathParam(event, "postId");
  const payload = parseJsonBody<Record<string, unknown>>(event.body);
  const input = schedulePostSchema.parse({ ...payload, postId });

  const post = await schedulePost(deps, userId, postId, input.scheduledAt, {
    timezone:
      input.timezone ??
      event.headers?.["x-noteship-timezone"] ??
      event.headers?.["X-Noteship-Timezone"],
    mode: input.mode,
  });
  return jsonResponse(200, postResponseSchema.parse(post));
});
