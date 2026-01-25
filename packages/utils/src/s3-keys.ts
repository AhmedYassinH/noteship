export const buildNoteContentKey = (userId: string, noteId: string): string =>
  `users/${userId}/notes/${noteId}/note.md`;

export const buildNoteArtifactKey = (
  userId: string,
  noteId: string,
  artifactId: string,
  extension: string,
): string => `users/${userId}/notes/${noteId}/artifacts/${artifactId}.${extension}`;

export const buildPostDraftKey = (userId: string, postId: string): string =>
  `users/${userId}/posts/${postId}/draft.md`;

export const buildPostPayloadKey = (userId: string, postId: string): string =>
  `users/${userId}/posts/${postId}/payload.json`;
