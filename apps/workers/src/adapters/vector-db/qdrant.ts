import { QdrantClient } from "@qdrant/js-client-rest";

export type VectorDbClient = {
  upsert: (_input: {
    collection: string;
    points: {
      id: string;
      vector: number[];
      payload: Record<string, unknown>;
    }[];
  }) => Promise<void>;
  delete: (_input: { collection: string; filter: Record<string, unknown> }) => Promise<void>;
};

export const createQdrantClient = (url: string, apiKey?: string): VectorDbClient => {
  const client = new QdrantClient({ url, apiKey });

  return {
    async upsert({ collection, points }) {
      await client.upsert(collection, {
        points,
      });
    },
    async delete({ collection, filter }) {
      await client.delete(collection, {
        filter,
      });
    },
  };
};
