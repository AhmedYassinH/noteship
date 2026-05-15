import { getAccessToken } from "../auth-spa";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

type ApiErrorPayload = {
  code?: string;
  message?: string;
};

export class ApiError extends Error {
  public readonly status: number;
  public readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export const apiFetch = async <T>(path: string, init: RequestInit = {}): Promise<T> => {
  const accessToken = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    credentials: init.credentials ?? "include",
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = undefined;
    }
    throw new ApiError(
      payload?.message || `API request failed (${response.status})`,
      response.status,
      payload?.code,
    );
  }

  return (await response.json()) as T;
};
