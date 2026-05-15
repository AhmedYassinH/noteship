export type NoteResponse = {
  noteId: string;
  title: string;
  tags: string[];
  s3Key: string;
  contentHash: string;
  embeddingStatus: "pending" | "ready" | "failed";
  embeddingVersion?: string;
  editorFormat?: "tiptap" | "markdown";
  createdAt: string;
  updatedAt: string;
};

export type NoteListResponse = {
  items: NoteResponse[];
  nextCursor?: string;
};

export type NoteWithContentResponse = NoteResponse & {
  content: string;
};

export type SearchResponse = {
  results: {
    noteId: string;
    title: string;
    score: number;
    preview?: string;
    highlights?: { chunkIndex: number }[];
    updatedAt?: string;
  }[];
};

export type PostResponse = {
  postId: string;
  noteId: string;
  provider: "linkedin" | "medium";
  publishMode?: "single" | "overflow_comments";
  status: "draft" | "queued" | "scheduled" | "publishing" | "published" | "failed";
  scheduledAt?: string;
  scheduledTimezone?: string;
  publishedAt?: string;
  contentS3Key?: string;
  createdAt: string;
  updatedAt: string;
};

export type PostListResponse = {
  items: PostResponse[];
  nextCursor?: string;
};

export type DraftResponse = {
  postId: string;
  provider: "linkedin" | "medium";
  content: string;
};

export type DraftCreateResponse = {
  drafts: DraftResponse[];
};

export type IntegrationProvider = "linkedin" | "medium";

export type IntegrationAccountResponse = {
  provider: IntegrationProvider;
  accountId: string;
  status: "connected" | "revoked" | "error";
  scopes?: string[];
  connectedAt: string;
  updatedAt: string;
};

export type IntegrationsListResponse = {
  items: IntegrationAccountResponse[];
};

export type ConnectIntegrationResponse = {
  url: string;
  state: string;
};

export type FinalizeIntegrationResponse = IntegrationAccountResponse;

export type PortalSessionResponse = {
  url: string;
};

export type NoteUploadResponse = {
  uploadUrl: string;
  s3Key: string;
  artifactId: string;
  publicUrl: string;
};

export type ContentSessionResponse = {
  ok: true;
};

export type RegenerateDraftResponse = {
  content: string;
};
