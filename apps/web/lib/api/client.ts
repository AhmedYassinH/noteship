import { getAccessToken } from "../auth-spa";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

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
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  return (await response.json()) as T;
};
