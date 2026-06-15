import { getSignedCookies } from "@aws-sdk/cloudfront-signer";
import { contentSessionResponseSchema } from "@noteship/domain";
import { getUserId } from "../../runtime/auth";
import { withDeps } from "../../runtime/handler";

const normalizePrivateKey = (value: string): string => {
  const trimmed = value.trim();
  if (trimmed.includes("-----BEGIN")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  const decoded = Buffer.from(trimmed, "base64").toString("utf8");
  return decoded.replace(/\\n/g, "\n");
};

const buildCookie = (
  name: string,
  value: string,
  options: { domain?: string; maxAgeSeconds: number },
): string => {
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "Secure", "SameSite=None"];
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  parts.push(`Max-Age=${options.maxAgeSeconds}`);
  return parts.join("; ");
};

const hostnameFromContentDomain = (contentDomain: string): string => {
  try {
    return new URL(
      contentDomain.includes("://") ? contentDomain : `https://${contentDomain}`,
    ).hostname.toLowerCase();
  } catch {
    return contentDomain.split("/")[0]?.split(":")[0]?.toLowerCase() ?? contentDomain;
  }
};

const isIpAddress = (hostname: string): boolean =>
  /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname) || hostname.includes(":");

const deriveCookieDomain = (contentDomain: string): string | undefined => {
  const hostname = hostnameFromContentDomain(contentDomain);
  if (!hostname || hostname === "localhost" || isIpAddress(hostname)) {
    return undefined;
  }

  if (hostname.endsWith(".cloudfront.net") || hostname.endsWith(".amazonaws.com")) {
    return undefined;
  }

  const labels = hostname.split(".").filter(Boolean);
  if (labels.length <= 2) {
    return undefined;
  }

  return labels.slice(-2).join(".");
};

const contentCookieDomainFor = (
  contentDomain: string,
  configuredDomain?: string,
): string | undefined => {
  const trimmedConfiguredDomain = configuredDomain?.trim();
  return trimmedConfiguredDomain || deriveCookieDomain(contentDomain);
};

const toEpochSeconds = (date: Date): number => Math.floor(date.getTime() / 1000);

const encodeContentPathSegment = (value: string): string => encodeURIComponent(value);

const buildContentSessionPolicy = (resourceUrl: string, expiresAt: Date): string =>
  JSON.stringify({
    Statement: [
      {
        Resource: resourceUrl,
        Condition: {
          DateLessThan: {
            "AWS:EpochTime": toEpochSeconds(expiresAt),
          },
        },
      },
    ],
  });

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const resourceUrl = `https://${deps.contentDomain}/users/${encodeContentPathSegment(userId)}/*`;
  const expiresAt = new Date(Date.now() + deps.contentSessionTtlSeconds * 1000);
  const privateKey = normalizePrivateKey(deps.cloudfrontPrivateKey);

  const signedCookies = getSignedCookies({
    policy: buildContentSessionPolicy(resourceUrl, expiresAt),
    keyPairId: deps.cloudfrontKeyPairId,
    privateKey,
  });

  const policy = signedCookies["CloudFront-Policy"];
  const expires = signedCookies["CloudFront-Expires"];
  const signature = signedCookies["CloudFront-Signature"];
  const keyPairId = signedCookies["CloudFront-Key-Pair-Id"];
  if ((!policy && !expires) || !signature || !keyPairId) {
    throw new Error("CloudFront signed cookies missing required values");
  }

  const maxAgeSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  const domain = contentCookieDomainFor(deps.contentDomain, deps.contentCookieDomain);

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-credentials": "true",
    },
    cookies: [
      ...(policy
        ? [
            buildCookie("CloudFront-Policy", policy, {
              domain,
              maxAgeSeconds,
            }),
          ]
        : []),
      ...(expires
        ? [
            buildCookie("CloudFront-Expires", String(expires), {
              domain,
              maxAgeSeconds,
            }),
          ]
        : []),
      buildCookie("CloudFront-Signature", signature, {
        domain,
        maxAgeSeconds,
      }),
      buildCookie("CloudFront-Key-Pair-Id", keyPairId, {
        domain,
        maxAgeSeconds,
      }),
    ],
    body: JSON.stringify(contentSessionResponseSchema.parse({ ok: true })),
  };
});
