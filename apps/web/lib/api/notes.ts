import { apiFetch } from "./client";
import type {
  ConnectIntegrationResponse,
  ContentSessionResponse,
  DraftCreateResponse,
  IntegrationProvider,
  IntegrationsListResponse,
  NoteListResponse,
  NoteResponse,
  NoteWithContentResponse,
  NoteUploadResponse,
  PortalSessionResponse,
  PostResponse,
  PostListResponse,
  SearchResponse,
} from "./types";

export const listNotes = (limit = 20, cursor?: string) => {
  const params = new URLSearchParams();
  params.set("limit", String(limit));
  if (cursor) params.set("cursor", cursor);
  return apiFetch<NoteListResponse>(`/notes?${params.toString()}`);
};

export const getNote = (noteId: string) => apiFetch<NoteWithContentResponse>(`/notes/${noteId}`);

export const createNote = (payload: {
  title: string;
  content: string;
  tags?: string[];
  editorFormat?: "tiptap" | "markdown";
}) =>
  apiFetch<NoteResponse>("/notes", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const updateNote = (
  noteId: string,
  payload: {
    title?: string;
    content?: string;
    tags?: string[];
    editorFormat?: "tiptap" | "markdown";
  },
) =>
  apiFetch<NoteWithContentResponse>(`/notes/${noteId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const searchNotes = (query: string, limit = 10) =>
  apiFetch<SearchResponse>("/search", {
    method: "POST",
    body: JSON.stringify({ query, limit }),
  });

export const generateDrafts = (
  noteId: string,
  provider: "linkedin" | "medium",
  tone?: string,
  language?: "en" | "ar",
) =>
  apiFetch<DraftCreateResponse>(`/notes/${noteId}/drafts`, {
    method: "POST",
    body: JSON.stringify({ provider, tone, language }),
  });

export const listPosts = (status?: string) => {
  const params = status ? `?status=${encodeURIComponent(status)}` : "";
  return apiFetch<PostListResponse>(`/posts${params}`);
};

export const createPost = (payload: {
  noteId: string;
  provider: "linkedin" | "medium";
  content?: string;
}) =>
  apiFetch<PostResponse>("/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const publishPost = (postId: string) =>
  apiFetch<void>(`/posts/${postId}/publish`, { method: "POST" });

export const schedulePost = (postId: string, scheduledAt: string) =>
  apiFetch<void>(`/posts/${postId}/schedule`, {
    method: "POST",
    body: JSON.stringify({ scheduledAt }),
  });

export const listIntegrations = () => apiFetch<IntegrationsListResponse>("/integrations");

export const connectIntegration = (provider: IntegrationProvider, redirectUrl?: string) =>
  apiFetch<ConnectIntegrationResponse>(`/integrations/${provider}/connect`, {
    method: "POST",
    body: JSON.stringify({ redirectUrl }),
  });

export const disconnectIntegration = (provider: IntegrationProvider) =>
  apiFetch<void>(`/integrations/${provider}/disconnect`, { method: "POST" });

export const createPortalSession = (returnUrl: string) =>
  apiFetch<PortalSessionResponse>("/billing/portal", {
    method: "POST",
    body: JSON.stringify({ returnUrl }),
  });

export const createNoteUpload = (
  noteId: string,
  payload: {
    filename: string;
    contentType: string;
    sizeBytes: number;
  },
) =>
  apiFetch<NoteUploadResponse>(`/notes/${noteId}/uploads`, {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const createContentSession = () =>
  apiFetch<ContentSessionResponse>("/content/session", {
    method: "POST",
  });
