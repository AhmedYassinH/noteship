export type VectorSearchResult = {
  id: string;
  score: number;
  payload: Record<string, unknown>;
};

export type VectorDbClient = {
  search: (_input: {
    collection: string;
    vector: number[];
    limit: number;
    userId: string;
  }) => Promise<VectorSearchResult[]>;
};
