import { randomUUID } from "node:crypto";
import {
  createConnector,
  normalizeLinkedInContent,
  splitLinkedInOverflowToComments,
} from "@noteship/connectors";
import type { LinkedInPublishPayload, Post } from "@noteship/domain";
import { linkedInPublishPayloadSchema } from "@noteship/domain";
import { safeStringify, buildPostPayloadKey } from "@noteship/utils";
import { getPostById, listScheduledPostsDue, putPost } from "../adapters/dynamodb/posts";
import { listIntegrationsForProvider } from "../adapters/dynamodb/integrations";
import { getObjectBinary, getObjectString } from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { decryptCredentials } from "../runtime/encryption";
import { logger } from "../runtime/logger";

const nowIso = (): string => new Date().toISOString();

type StoredConnectorCredentials = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  refreshTokenExpiresAt?: string;
};

const formatErrorPayload = (error: unknown): { error: string; stack?: string } => {
  if (error instanceof Error) {
    return { error: error.message, stack: error.stack };
  }

  return { error: safeStringify(error) };
};

const isRetryablePublishError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();
  return (
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("temporar") ||
    normalized.includes("rate limit") ||
    normalized.includes("too many requests") ||
    normalized.includes("(429)") ||
    normalized.includes("(500)") ||
    normalized.includes("(502)") ||
    normalized.includes("(503)") ||
    normalized.includes("(504)")
  );
};

const loadLinkedInPayload = async (
  deps: Deps,
  post: Post,
): Promise<LinkedInPublishPayload | null> => {
  const payloadKey = buildPostPayloadKey(post.userId, post.provider, post.postId);
  try {
    const raw = await getObjectString(deps.s3, deps.bucketName, payloadKey);
    if (!raw) return null;
    return linkedInPublishPayloadSchema.parse(JSON.parse(raw));
  } catch (error) {
    logger.warn("linkedin_payload_load_failed", {
      postId: post.postId,
      provider: post.provider,
      payloadKey,
      ...formatErrorPayload(error),
    });
    return null;
  }
};

const inferContentType = (s3Key: string, hinted?: string): string => {
  if (hinted && hinted.length > 0) return hinted;
  const lowered = s3Key.toLowerCase();
  if (lowered.endsWith(".png")) return "image/png";
  if (lowered.endsWith(".jpg") || lowered.endsWith(".jpeg")) return "image/jpeg";
  if (lowered.endsWith(".gif")) return "image/gif";
  if (lowered.endsWith(".webp")) return "image/webp";
  if (lowered.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
};

const toArrayBuffer = (bytes: Uint8Array): ArrayBuffer =>
  bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;

const loadLinkedInMediaInput = async (
  deps: Deps,
  media: LinkedInPublishPayload["media"],
): Promise<
  | undefined
  | {
      type: "images";
      images: Array<{ bytes: ArrayBuffer; contentType: string; altText?: string }>;
    }
  | {
      type: "pdf";
      pdf: { bytes: ArrayBuffer; contentType: string; title?: string };
    }
> => {
  if (media.type === "none") {
    return undefined;
  }

  if (media.type === "images") {
    return {
      type: "images",
      images: await Promise.all(
        media.images.map(async (image) => {
          const artifact = await getObjectBinary(deps.s3, deps.bucketName, image.s3Key);
          return {
            bytes: toArrayBuffer(artifact.bytes),
            contentType: inferContentType(image.s3Key, artifact.contentType),
            altText: image.altText,
          };
        }),
      ),
    };
  }

  const artifact = await getObjectBinary(deps.s3, deps.bucketName, media.pdf.s3Key);
  return {
    type: "pdf",
    pdf: {
      bytes: toArrayBuffer(artifact.bytes),
      contentType: inferContentType(media.pdf.s3Key, artifact.contentType),
      title: media.pdf.title,
    },
  };
};

export const publishPost = async (
  deps: Deps,
  input: { userId: string; postId: string; mode?: "single" | "overflow_comments" },
): Promise<Post> => {
  const publishStart = Date.now();
  logger.info("publish_post_invoked", {
    userId: input.userId,
    postId: input.postId,
    requestedMode: input.mode,
  });

  const post = await getPostById(deps.ddb, deps.tableNames.posts, input.userId, input.postId);
  if (!post) {
    throw new Error("Post not found");
  }

  logger.info("publish_post_loaded", {
    postId: post.postId,
    provider: post.provider,
    status: post.status,
    publishMode: post.publishMode,
    hasContentS3Key: Boolean(post.contentS3Key),
  });

  if (post.status === "published") {
    logger.info("publish_post_skipped_already_published", { postId: post.postId });
    return post;
  }

  const [account] = await listIntegrationsForProvider(
    deps.ddb,
    deps.tableNames.integrations,
    input.userId,
    post.provider,
  );

  const encryptedCredentials =
    account?.credentialsCiphertext &&
    account.credentialsIv &&
    account.credentialsTag &&
    account.credentialsAlg &&
    account.credentialsKeyVersion
      ? {
          ciphertext: account.credentialsCiphertext,
          iv: account.credentialsIv,
          tag: account.credentialsTag,
          alg: account.credentialsAlg,
          keyVersion: account.credentialsKeyVersion,
        }
      : null;

  logger.info("publish_integration_lookup", {
    postId: post.postId,
    provider: post.provider,
    foundAccount: Boolean(account),
    accountId: account?.accountId,
    hasEncryptedCredentials: Boolean(encryptedCredentials),
  });

  if (!account || !encryptedCredentials) {
    const failed: Post = {
      ...post,
      status: "failed",
      error: { code: "NO_INTEGRATION", message: "Integration not connected" },
      updatedAt: nowIso(),
    };
    await putPost(deps.ddb, deps.tableNames.posts, failed);
    logger.warn("publish_post_failed_no_integration", {
      postId: post.postId,
      provider: post.provider,
      durationMs: Date.now() - publishStart,
    });
    return failed;
  }

  let credentials: StoredConnectorCredentials;
  try {
    credentials = decryptCredentials<StoredConnectorCredentials>(
      encryptedCredentials,
      deps.integrationSecurity.credentialsKeyB64,
    );
  } catch (error) {
    const failed: Post = {
      ...post,
      status: "failed",
      error: { code: "CREDENTIALS_DECRYPT_FAILED", message: String(error) },
      updatedAt: nowIso(),
    };
    await putPost(deps.ddb, deps.tableNames.posts, failed);
    logger.error("publish_post_failed_credentials_decrypt", {
      postId: post.postId,
      provider: post.provider,
      durationMs: Date.now() - publishStart,
      ...formatErrorPayload(error),
    });
    return failed;
  }

  if (credentials.expiresAt && credentials.expiresAt <= nowIso()) {
    const failed: Post = {
      ...post,
      status: "failed",
      error: { code: "TOKEN_EXPIRED", message: "Integration token expired. Reconnect LinkedIn." },
      updatedAt: nowIso(),
    };
    await putPost(deps.ddb, deps.tableNames.posts, failed);
    logger.warn("publish_post_failed_token_expired", {
      postId: post.postId,
      provider: post.provider,
      tokenExpiresAt: credentials.expiresAt,
      durationMs: Date.now() - publishStart,
    });
    return failed;
  }

  const content = post.contentS3Key
    ? await getObjectString(deps.s3, deps.bucketName, post.contentS3Key)
    : "";
  const mode = input.mode ?? post.publishMode ?? "single";
  logger.info("publish_content_loaded", {
    postId: post.postId,
    provider: post.provider,
    mode,
    charCount: [...content].length,
  });

  const connectorConfig = deps.connectors[post.provider];
  const apiVersion = post.provider === "linkedin" ? deps.connectors.linkedin.apiVersion : undefined;
  const connector = createConnector(post.provider, {
    clientId: connectorConfig.clientId,
    clientSecret: connectorConfig.clientSecret,
    apiVersion,
  });

  const accountTarget = account.providerMetadata?.personUrn ?? account.accountId;

  try {
    if (post.provider === "linkedin") {
      const payload = await loadLinkedInPayload(deps, post);
      const normalized = payload?.normalizedContent ?? normalizeLinkedInContent(content);

      if (mode === "overflow_comments") {
        if (!connector.publishComment) {
          throw new Error("Connector does not support overflow comments");
        }
        const overflow = splitLinkedInOverflowToComments(
          normalized,
          deps.linkedin.textMaxChars,
          deps.linkedin.commentMaxChars,
        );

        if (payload?.media.type === "pdf") {
          throw new Error(
            "LinkedIn overflow_comments mode is not supported when publishing a PDF document.",
          );
        }

        const media = payload ? await loadLinkedInMediaInput(deps, payload.media) : undefined;

        const root = await connector.publishPost({
          accountId: accountTarget,
          accessToken: credentials.accessToken,
          content: overflow.root,
          media,
        });

        for (const comment of overflow.comments) {
          await connector.publishComment({
            accountId: accountTarget,
            accessToken: credentials.accessToken,
            parentId: root.remoteId,
            content: comment,
          });
        }
      } else {
        const media = payload ? await loadLinkedInMediaInput(deps, payload.media) : undefined;

        await connector.publishPost({
          accountId: accountTarget,
          accessToken: credentials.accessToken,
          content: normalized,
          media,
        });
      }
    } else {
      await connector.publishPost({
        accountId: accountTarget,
        accessToken: credentials.accessToken,
        content,
      });
    }

    const updated: Post = {
      ...post,
      publishMode: mode,
      status: "published",
      publishedAt: nowIso(),
      updatedAt: nowIso(),
    };
    await putPost(deps.ddb, deps.tableNames.posts, updated);
    logger.info("publish_post_completed", {
      postId: post.postId,
      provider: post.provider,
      mode,
      status: updated.status,
      durationMs: Date.now() - publishStart,
    });
    return updated;
  } catch (error) {
    logger.error("publish_provider_call_failed", {
      postId: post.postId,
      provider: post.provider,
      mode,
      durationMs: Date.now() - publishStart,
      ...formatErrorPayload(error),
    });

    if (isRetryablePublishError(error)) {
      logger.warn("publish_provider_call_retryable", {
        postId: post.postId,
        provider: post.provider,
        mode,
        reason: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }

    const failed: Post = {
      ...post,
      status: "failed",
      error: { code: "PUBLISH_FAILED", message: String(error) },
      updatedAt: nowIso(),
    };
    await putPost(deps.ddb, deps.tableNames.posts, failed);
    return failed;
  }
};

export const dispatchScheduledPosts = async (deps: Deps): Promise<number> => {
  const now = nowIso();
  const posts = await listScheduledPostsDue(deps.ddb, deps.tableNames.posts, now);
  logger.info("scheduled_posts_due_loaded", {
    dueCount: posts.length,
    postIds: posts.map((post) => post.postId),
  });

  await Promise.all(
    posts.map((post) =>
      enqueueJob(deps.sqs, deps.jobsQueueUrl, {
        jobId: randomUUID(),
        type: "PUBLISH_POST",
        userId: post.userId,
        createdAt: now,
        payload: { postId: post.postId, mode: post.publishMode },
      }),
    ),
  );

  logger.info("scheduled_posts_enqueued", {
    enqueuedCount: posts.length,
  });

  return posts.length;
};
