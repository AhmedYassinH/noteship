import { listNotesQuerySchema, noteListResponseSchema } from "@noteship/domain";
import { listNotesForUser } from "../../use-cases/notes";
import { getUserId } from "../../runtime/auth";
import { jsonResponse } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";

const parseQuery = (params: Record<string, string | undefined> | null | undefined) => ({
  cursor: params?.cursor,
  limit: params?.limit ? Number(params.limit) : undefined,
});

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const query = listNotesQuerySchema.parse(parseQuery(event.queryStringParameters ?? undefined));
  const result = await listNotesForUser(deps, userId, query.limit, query.cursor);

  return jsonResponse(200, noteListResponseSchema.parse(result));
});
