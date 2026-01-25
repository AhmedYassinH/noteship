import { QdrantClient } from "@qdrant/js-client-rest";
import type { VectorDbClient } from "./types";

export const createQdrantClient = (url: string, apiKey?: string): VectorDbClient => {
  const client = new QdrantClient({ url, apiKey });

  return {
    async search({ collection, vector, limit, userId }) {
      const result = await client.query(collection, {
        query: vector,
        limit,
        with_payload: true,
        filter: {
          must: [
            {
              key: "userId",
              match: { value: userId },
            },
          ],
        },
      });

      const points = Array.isArray((result as { points?: unknown }).points)
        ? (result as { points: Array<Record<string, unknown>> }).points
        : [];

      return points.map((hit) => ({
        id: String(hit.id),
        score: typeof hit.score === "number" ? hit.score : 0,
        payload: (hit.payload ?? {}) as Record<string, unknown>,
      }));
    },
  };
};
