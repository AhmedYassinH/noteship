export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

export const notFound = (message: string): HttpError => new HttpError(404, "NOT_FOUND", message);
export const badRequest = (message: string): HttpError =>
  new HttpError(400, "BAD_REQUEST", message);
export const unauthorized = (message: string): HttpError =>
  new HttpError(401, "UNAUTHORIZED", message);
export const forbidden = (message: string): HttpError => new HttpError(403, "FORBIDDEN", message);
export const notImplemented = (message: string): HttpError =>
  new HttpError(501, "NOT_IMPLEMENTED", message);
