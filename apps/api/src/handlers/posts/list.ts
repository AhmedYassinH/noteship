import { listPostsQuerySchema, postListResponseSchema } from "@noteship/domain";
import { listPostsForUser } from "../../use-cases/posts";
import { getUserId } from "../../runtime/auth";
import { jsonResponse } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";

const parseQuery = (params: Record<string, string | undefined> | null | undefined) => ({
  status: params?.status,
  cursor: params?.cursor,
  limit: params?.limit ? Number(params.limit) : undefined,
});

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const query = listPostsQuerySchema.parse(parseQuery(event.queryStringParameters ?? undefined));

  const result = await listPostsForUser(deps, userId, query.status, query.limit, query.cursor);
  return jsonResponse(200, postListResponseSchema.parse(result));
});
