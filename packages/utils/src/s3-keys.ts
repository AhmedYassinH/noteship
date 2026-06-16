export const buildNoteContentKey = (userId: string, noteId: string): string =>
  `users/${userId}/notes/${noteId}/note.md`;

export const buildNoteArtifactKey = (
  userId: string,
  noteId: string,
  artifactId: string,
  extension: string,
): string => `users/${userId}/notes/${noteId}/artifacts/${artifactId}.${extension}`;

export const buildTemporaryNoteArtifactKey = (
  userId: string,
  noteId: string,
  artifactId: string,
  extension: string,
): string => `uploads/tmp/users/${userId}/notes/${noteId}/artifacts/${artifactId}.${extension}`;

export const buildPostDraftKey = (userId: string, provider: string, postId: string): string =>
  `users/${userId}/posts/${provider}/${postId}/draft.md`;

export const buildPostPayloadKey = (userId: string, provider: string, postId: string): string =>
  `users/${userId}/posts/${provider}/${postId}/payload.json`;
