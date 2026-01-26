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
  const parts = [`${name}=${value}`, "Path=/", "HttpOnly", "Secure", "SameSite=Lax"];
  if (options.domain) {
    parts.push(`Domain=${options.domain}`);
  }
  parts.push(`Max-Age=${options.maxAgeSeconds}`);
  return parts.join("; ");
};

export const handler = withDeps(async (deps, event) => {
  const userId = getUserId(event);
  const resourceUrl = `https://${deps.contentDomain}/users/${userId}/*`;
  const expiresAt = new Date(Date.now() + 12 * 60 * 60 * 1000);
  const privateKey = normalizePrivateKey(deps.cloudfrontPrivateKey);

  const signedCookies = getSignedCookies({
    url: resourceUrl,
    keyPairId: deps.cloudfrontKeyPairId,
    privateKey,
    dateLessThan: expiresAt.toISOString(),
  });

  const policy = signedCookies["CloudFront-Policy"];
  const signature = signedCookies["CloudFront-Signature"];
  const keyPairId = signedCookies["CloudFront-Key-Pair-Id"];
  if (!policy || !signature || !keyPairId) {
    throw new Error("CloudFront signed cookies missing required values");
  }

  const maxAgeSeconds = Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  const domain = deps.contentCookieDomain;

  return {
    statusCode: 200,
    headers: {
      "content-type": "application/json",
      "access-control-allow-credentials": "true",
    },
    cookies: [
      buildCookie("CloudFront-Policy", policy, {
        domain,
        maxAgeSeconds,
      }),
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
