export const encodeCursor = (key: Record<string, unknown> | undefined): string | undefined =>
  key ? Buffer.from(JSON.stringify(key)).toString("base64") : undefined;

export const decodeCursor = (cursor: string | undefined): Record<string, unknown> | undefined => {
  if (!cursor) {
    return undefined;
  }

  return JSON.parse(Buffer.from(cursor, "base64").toString("utf-8")) as Record<string, unknown>;
};
