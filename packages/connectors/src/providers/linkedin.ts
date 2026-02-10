import type { Connector, ConnectorConfig } from "../types";

const DEFAULT_SCOPES = ["r_liteprofile", "w_member_social"];
const RESTLI_PROTOCOL_VERSION = "2.0.0";

type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
  scope?: string;
};

type LinkedInProfileResponse = {
  id: string;
};

const nowPlusSecondsIso = (seconds: number): string =>
  new Date(Date.now() + seconds * 1000).toISOString();

const ensureOk = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return (await response.json()) as T;
  }

  let message = `LinkedIn request failed (${response.status})`;
  try {
    const payload = (await response.json()) as { message?: string };
    if (payload?.message) {
      message = payload.message;
    }
  } catch {
    // ignore body parse failures
  }

  throw new Error(message);
};

const buildLinkedInHeaders = (accessToken: string, apiVersion?: string): Headers => {
  const headers = new Headers();
  headers.set("Authorization", `Bearer ${accessToken}`);
  headers.set("Content-Type", "application/json");
  headers.set("X-Restli-Protocol-Version", RESTLI_PROTOCOL_VERSION);
  if (apiVersion) {
    headers.set("LinkedIn-Version", apiVersion);
  }
  return headers;
};

export const createLinkedInConnector = (config: ConnectorConfig): Connector => {
  return {
    provider: "linkedin",
    buildOAuthUrl({ state, redirectUri }) {
      if (!redirectUri) {
        throw new Error("LinkedIn redirectUri is required");
      }

      const url = new URL("https://www.linkedin.com/oauth/v2/authorization");
      url.searchParams.set("response_type", "code");
      url.searchParams.set("client_id", config.clientId);
      url.searchParams.set("redirect_uri", redirectUri);
      url.searchParams.set("state", state);
      url.searchParams.set("scope", DEFAULT_SCOPES.join(" "));

      return url.toString();
    },
    async exchangeCode({ code, redirectUri }) {
      if (!redirectUri) {
        throw new Error("LinkedIn redirectUri is required for code exchange");
      }

      const tokenBody = new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: redirectUri,
        client_id: config.clientId,
        client_secret: config.clientSecret,
      });

      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenBody.toString(),
      });

      const tokenPayload = await ensureOk<LinkedInTokenResponse>(tokenResponse);
      const profileResponse = await fetch("https://api.linkedin.com/v2/me", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
          "X-Restli-Protocol-Version": RESTLI_PROTOCOL_VERSION,
        },
      });
      const profile = await ensureOk<LinkedInProfileResponse>(profileResponse);

      return {
        accountId: profile.id,
        credentials: {
          accessToken: tokenPayload.access_token,
          expiresAt: nowPlusSecondsIso(tokenPayload.expires_in),
        },
        scopes: tokenPayload.scope?.split(" ").filter(Boolean),
        providerMetadata: {
          personUrn: `urn:li:person:${profile.id}`,
        },
      };
    },
    async publishPost({ accountId, accessToken, content }) {
      const authorUrn = accountId.startsWith("urn:li:person:")
        ? accountId
        : `urn:li:person:${accountId}`;
      const response = await fetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: buildLinkedInHeaders(accessToken, config.apiVersion),
        body: JSON.stringify({
          author: authorUrn,
          commentary: content,
          visibility: "PUBLIC",
          lifecycleState: "PUBLISHED",
          distribution: {
            feedDistribution: "MAIN_FEED",
            targetEntities: [],
            thirdPartyDistributionChannels: [],
          },
          isReshareDisabledByAuthor: false,
        }),
      });

      if (!response.ok) {
        await ensureOk(response);
      }

      const restliId = response.headers.get("x-restli-id");
      const payload = (await response.json().catch(() => null)) as {
        id?: string;
        activity?: string;
      } | null;
      const remoteId = restliId ?? payload?.id ?? payload?.activity ?? "";
      if (!remoteId) {
        throw new Error("LinkedIn publish succeeded but no post id was returned");
      }

      return { remoteId };
    },
    async publishComment({ accountId, accessToken, parentId, content }) {
      const actor = accountId.startsWith("urn:li:person:")
        ? accountId
        : `urn:li:person:${accountId}`;
      const encodedParent = encodeURIComponent(parentId);
      const response = await fetch(
        `https://api.linkedin.com/rest/socialActions/${encodedParent}/comments`,
        {
          method: "POST",
          headers: buildLinkedInHeaders(accessToken, config.apiVersion),
          body: JSON.stringify({
            actor,
            message: { text: content },
          }),
        },
      );

      if (!response.ok) {
        await ensureOk(response);
      }

      const restliId = response.headers.get("x-restli-id");
      const payload = (await response.json().catch(() => null)) as { id?: string } | null;
      const remoteId = restliId ?? payload?.id ?? "";
      if (!remoteId) {
        throw new Error("LinkedIn comment publish succeeded but no comment id was returned");
      }
      return { remoteId };
    },
  };
};
