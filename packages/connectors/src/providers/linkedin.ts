import type { Connector, ConnectorConfig } from "../types";

const DEFAULT_SCOPES = ["openid", "profile", "w_member_social"];
const RESTLI_PROTOCOL_VERSION = "2.0.0";

type LinkedInTokenResponse = {
  access_token: string;
  expires_in: number;
  scope?: string;
};

type LinkedInUserInfoResponse = {
  sub: string;
};

type LinkedInImageInitResponse = {
  value?: {
    uploadUrl?: string;
    image?: string;
  };
  uploadUrl?: string;
  image?: string;
};

type LinkedInDocumentInitResponse = {
  value?: {
    uploadUrl?: string;
    document?: string;
  };
  uploadUrl?: string;
  document?: string;
};

type UploadedImageInput = {
  bytes: ArrayBuffer;
  contentType: string;
  altText?: string;
};

type UploadedPdfInput = {
  bytes: ArrayBuffer;
  contentType: string;
  title?: string;
};

const nowPlusSecondsIso = (seconds: number): string =>
  new Date(Date.now() + seconds * 1000).toISOString();

const logInfo = (event: string, payload: Record<string, unknown>): void => {
  console.info(`[linkedin_connector] ${event}`, payload);
};

const parseLinkedInError = async (response: Response): Promise<string> => {
  try {
    const payload = (await response.json()) as
      | { message?: string; error_description?: string }
      | { error?: { message?: string } };
    if ("message" in payload && payload.message) return payload.message;
    if ("error_description" in payload && payload.error_description)
      return payload.error_description;
    if ("error" in payload && payload.error?.message) return payload.error.message;
  } catch {
    // ignore body parse failures
  }
  return `LinkedIn request failed (${response.status})`;
};

const ensureOk = async <T>(response: Response): Promise<T> => {
  if (response.ok) {
    return (await response.json()) as T;
  }

  throw new Error(await parseLinkedInError(response));
};

const ensureUploadOk = async (response: Response): Promise<void> => {
  if (response.ok) return;
  throw new Error(await parseLinkedInError(response));
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

const buildAuthorUrn = (accountId: string): string =>
  accountId.startsWith("urn:li:person:") ? accountId : `urn:li:person:${accountId}`;

const extractImageUploadInfo = (
  payload: LinkedInImageInitResponse,
): { uploadUrl: string; urn: string } => {
  const uploadUrl = payload.value?.uploadUrl ?? payload.uploadUrl;
  const urn = payload.value?.image ?? payload.image;
  if (!uploadUrl || !urn) {
    throw new Error("LinkedIn image initialize upload response is missing upload URL or image URN");
  }
  return { uploadUrl, urn };
};

const extractDocumentUploadInfo = (
  payload: LinkedInDocumentInitResponse,
): { uploadUrl: string; urn: string } => {
  const uploadUrl = payload.value?.uploadUrl ?? payload.uploadUrl;
  const urn = payload.value?.document ?? payload.document;
  if (!uploadUrl || !urn) {
    throw new Error(
      "LinkedIn document initialize upload response is missing upload URL or document URN",
    );
  }
  return { uploadUrl, urn };
};

const uploadImage = async (
  accessToken: string,
  apiVersion: string | undefined,
  authorUrn: string,
  image: UploadedImageInput,
): Promise<{ urn: string; altText?: string }> => {
  const initStart = Date.now();
  const initResponse = await fetch("https://api.linkedin.com/rest/images?action=initializeUpload", {
    method: "POST",
    headers: buildLinkedInHeaders(accessToken, apiVersion),
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: authorUrn,
      },
    }),
  });
  logInfo("image_initialize_upload_response", {
    owner: authorUrn,
    status: initResponse.status,
    ok: initResponse.ok,
    durationMs: Date.now() - initStart,
  });
  const initPayload = await ensureOk<LinkedInImageInitResponse>(initResponse);
  const { uploadUrl, urn } = extractImageUploadInfo(initPayload);

  const uploadStart = Date.now();
  const binaryResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": image.contentType,
    },
    body: image.bytes,
  });
  logInfo("image_binary_upload_response", {
    owner: authorUrn,
    imageUrn: urn,
    status: binaryResponse.status,
    ok: binaryResponse.ok,
    durationMs: Date.now() - uploadStart,
    contentType: image.contentType,
    sizeBytes: image.bytes.byteLength,
  });
  await ensureUploadOk(binaryResponse);

  return { urn, altText: image.altText };
};

const uploadDocument = async (
  accessToken: string,
  apiVersion: string | undefined,
  authorUrn: string,
  pdf: UploadedPdfInput,
): Promise<{ urn: string; title?: string }> => {
  const initStart = Date.now();
  const initResponse = await fetch(
    "https://api.linkedin.com/rest/documents?action=initializeUpload",
    {
      method: "POST",
      headers: buildLinkedInHeaders(accessToken, apiVersion),
      body: JSON.stringify({
        initializeUploadRequest: {
          owner: authorUrn,
        },
      }),
    },
  );
  logInfo("document_initialize_upload_response", {
    owner: authorUrn,
    status: initResponse.status,
    ok: initResponse.ok,
    durationMs: Date.now() - initStart,
  });
  const initPayload = await ensureOk<LinkedInDocumentInitResponse>(initResponse);
  const { uploadUrl, urn } = extractDocumentUploadInfo(initPayload);

  const uploadStart = Date.now();
  const binaryResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": pdf.contentType,
    },
    body: pdf.bytes,
  });
  logInfo("document_binary_upload_response", {
    owner: authorUrn,
    documentUrn: urn,
    status: binaryResponse.status,
    ok: binaryResponse.ok,
    durationMs: Date.now() - uploadStart,
    contentType: pdf.contentType,
    sizeBytes: pdf.bytes.byteLength,
  });
  await ensureUploadOk(binaryResponse);

  return { urn, title: pdf.title };
};

const buildPostBody = (
  authorUrn: string,
  content: string,
  media?:
    | {
        type: "images";
        images: Array<{ urn: string; altText?: string }>;
      }
    | {
        type: "pdf";
        pdf: { urn: string; title?: string };
      },
): Record<string, unknown> => {
  const base: Record<string, unknown> = {
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
  };

  if (!media) {
    return base;
  }

  if (media.type === "images") {
    if (media.images.length === 1) {
      return {
        ...base,
        content: {
          media: {
            id: media.images[0].urn,
            ...(media.images[0].altText ? { altText: media.images[0].altText } : {}),
          },
        },
      };
    }

    return {
      ...base,
      content: {
        multiImage: {
          images: media.images.map((item) => ({
            id: item.urn,
            ...(item.altText ? { altText: item.altText } : {}),
          })),
        },
      },
    };
  }

  return {
    ...base,
    content: {
      media: {
        id: media.pdf.urn,
        ...(media.pdf.title ? { title: media.pdf.title } : {}),
      },
    },
  };
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

      const tokenStart = Date.now();
      const tokenResponse = await fetch("https://www.linkedin.com/oauth/v2/accessToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: tokenBody.toString(),
      });
      logInfo("exchange_code_token_response", {
        status: tokenResponse.status,
        ok: tokenResponse.ok,
        durationMs: Date.now() - tokenStart,
      });

      const tokenPayload = await ensureOk<LinkedInTokenResponse>(tokenResponse);
      const userInfoStart = Date.now();
      const userInfoResponse = await fetch("https://api.linkedin.com/v2/userinfo", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${tokenPayload.access_token}`,
        },
      });
      logInfo("userinfo_response", {
        status: userInfoResponse.status,
        ok: userInfoResponse.ok,
        durationMs: Date.now() - userInfoStart,
      });
      const userInfo = await ensureOk<LinkedInUserInfoResponse>(userInfoResponse);
      if (!userInfo.sub) {
        throw new Error("LinkedIn userinfo response did not include subject identifier");
      }

      return {
        accountId: userInfo.sub,
        credentials: {
          accessToken: tokenPayload.access_token,
          expiresAt: nowPlusSecondsIso(tokenPayload.expires_in),
        },
        scopes: tokenPayload.scope?.split(" ").filter(Boolean),
        providerMetadata: {
          personUrn: `urn:li:person:${userInfo.sub}`,
        },
      };
    },
    async publishPost({ accountId, accessToken, content, media }) {
      const authorUrn = buildAuthorUrn(accountId);

      let resolvedMedia:
        | undefined
        | {
            type: "images";
            images: Array<{ urn: string; altText?: string }>;
          }
        | {
            type: "pdf";
            pdf: { urn: string; title?: string };
          };

      if (media?.type === "images") {
        const uploaded = [];
        for (const image of media.images) {
          uploaded.push(await uploadImage(accessToken, config.apiVersion, authorUrn, image));
        }
        resolvedMedia = {
          type: "images",
          images: uploaded,
        };
      } else if (media?.type === "pdf") {
        const uploaded = await uploadDocument(accessToken, config.apiVersion, authorUrn, media.pdf);
        resolvedMedia = {
          type: "pdf",
          pdf: uploaded,
        };
      }

      const publishStart = Date.now();
      const response = await fetch("https://api.linkedin.com/rest/posts", {
        method: "POST",
        headers: buildLinkedInHeaders(accessToken, config.apiVersion),
        body: JSON.stringify(buildPostBody(authorUrn, content, resolvedMedia)),
      });
      logInfo("publish_post_response", {
        authorUrn,
        status: response.status,
        ok: response.ok,
        durationMs: Date.now() - publishStart,
        contentLength: [...content].length,
        mediaType: resolvedMedia?.type ?? "none",
        mediaCount: resolvedMedia?.type === "images" ? resolvedMedia.images.length : undefined,
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

      logInfo("publish_post_succeeded", {
        authorUrn,
        remoteId,
      });

      return { remoteId };
    },
    async publishComment({ accountId, accessToken, parentId, content }) {
      const actor = buildAuthorUrn(accountId);
      const encodedParent = encodeURIComponent(parentId);
      const commentStart = Date.now();
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
      logInfo("publish_comment_response", {
        actor,
        parentId,
        status: response.status,
        ok: response.ok,
        durationMs: Date.now() - commentStart,
        contentLength: [...content].length,
      });

      if (!response.ok) {
        await ensureOk(response);
      }

      const restliId = response.headers.get("x-restli-id");
      const payload = (await response.json().catch(() => null)) as { id?: string } | null;
      const remoteId = restliId ?? payload?.id ?? "";
      if (!remoteId) {
        throw new Error("LinkedIn comment publish succeeded but no comment id was returned");
      }
      logInfo("publish_comment_succeeded", {
        actor,
        parentId,
        remoteId,
      });
      return { remoteId };
    },
  };
};
