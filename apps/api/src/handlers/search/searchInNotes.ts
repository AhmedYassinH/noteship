import { searchRequestSchema, searchResultSchema } from "@noteship/domain";
import { getUserId } from "../../runtime/auth";
import { jsonResponse, parseJsonBody } from "../../runtime/http";
import { withDeps } from "../../runtime/handler";
import { searchNotes } from "../../use-cases/search";

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const payload = parseJsonBody(event.body);
  const input = searchRequestSchema.parse(payload);

  const results = await searchNotes(deps, userId, input.query, input.limit);

  return jsonResponse(200, {
    results: searchResultSchema.parse(
      results.map((result) => ({
        noteId: result.note.noteId,
        title: result.note.title,
        score: result.score,
        preview: result.preview,
        highlights:
          result.chunkIndex !== undefined ? [{ chunkIndex: result.chunkIndex }] : undefined,
        updatedAt: result.note.updatedAt,
      })),
    ),
  });
});
