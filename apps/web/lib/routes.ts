export const noteHref = (noteId: string): string =>
  `/dashboard/notes?noteId=${encodeURIComponent(noteId)}`;
