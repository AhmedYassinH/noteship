import type { VectorDbClient } from "./types";
import { createQdrantClient } from "./qdrant";

export type VectorDbProvider = "qdrant";

export const createVectorDbClient = (
  provider: VectorDbProvider,
  url: string,
  apiKey?: string,
): VectorDbClient => {
  if (provider === "qdrant") {
    return createQdrantClient(url, apiKey);
  }

  throw new Error(`Unsupported vector DB provider: ${provider}`);
};

export type { VectorDbClient, VectorSearchResult } from "./types";
