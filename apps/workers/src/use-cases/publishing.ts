import { createConnector } from "@noteship/connectors";
import {
  normalizeLinkedInContent,
  splitLinkedInOverflowToComments,
  validateLinkedInContent,
} from "@noteship/connectors";
import type { Post } from "@noteship/domain";
import { getPostById, listScheduledPostsDue, putPost } from "../adapters/dynamodb/posts";
import { listIntegrationsForProvider } from "../adapters/dynamodb/integrations";
import { getObjectString } from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { randomUUID } from "node:crypto";
import { decryptCredentials } from "../runtime/encryption";
import { logger } from "../runtime/logger";
import { safeStringify } from "@noteship/utils";

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

  const updated = await (async (): Promise<Post> => {
    try {
      const accountTarget = account.providerMetadata?.personUrn ?? account.accountId;

      if (post.provider === "linkedin") {
        const normalized = normalizeLinkedInContent(content);
        const validation = validateLinkedInContent(normalized, deps.linkedin.textMaxChars);
        logger.info("linkedin_content_validated", {
          postId: post.postId,
          mode,
          charCount: validation.charCount,
          valid: validation.ok,
        });
        if (!validation.ok && mode === "single") {
          throw new Error(validation.reason);
        }

        if (mode === "overflow_comments") {
          if (!connector.publishComment) {
            throw new Error("Connector does not support overflow comments");
          }
          const overflow = splitLinkedInOverflowToComments(
            normalized,
            deps.linkedin.textMaxChars,
            deps.linkedin.commentMaxChars,
          );
          logger.info("linkedin_overflow_split", {
            postId: post.postId,
            rootCharCount: [...overflow.root].length,
            commentCount: overflow.comments.length,
          });

          const rootStart = Date.now();
          const root = await connector.publishPost({
            accountId: accountTarget,
            accessToken: credentials.accessToken,
            content: overflow.root,
          });
          logger.info("linkedin_publish_root_succeeded", {
            postId: post.postId,
            remoteId: root.remoteId,
            durationMs: Date.now() - rootStart,
          });

          for (const [index, comment] of overflow.comments.entries()) {
            const commentStart = Date.now();
            const commentResult = await connector.publishComment({
              accountId: accountTarget,
              accessToken: credentials.accessToken,
              parentId: root.remoteId,
              content: comment,
            });
            logger.info("linkedin_publish_comment_succeeded", {
              postId: post.postId,
              parentRemoteId: root.remoteId,
              commentRemoteId: commentResult.remoteId,
              commentIndex: index,
              commentCount: overflow.comments.length,
              durationMs: Date.now() - commentStart,
            });
          }
        } else {
          const publishStartMs = Date.now();
          const result = await connector.publishPost({
            accountId: accountTarget,
            accessToken: credentials.accessToken,
            content: normalized,
          });
          logger.info("linkedin_publish_succeeded", {
            postId: post.postId,
            remoteId: result.remoteId,
            durationMs: Date.now() - publishStartMs,
          });
        }
      } else {
        const publishStartMs = Date.now();
        const result = await connector.publishPost({
          accountId: accountTarget,
          accessToken: credentials.accessToken,
          content,
        });
        logger.info("provider_publish_succeeded", {
          postId: post.postId,
          provider: post.provider,
          remoteId: result.remoteId,
          durationMs: Date.now() - publishStartMs,
        });
      }

      return {
        ...post,
        publishMode: mode,
        status: "published",
        publishedAt: nowIso(),
        updatedAt: nowIso(),
      };
    } catch (error) {
      logger.error("publish_provider_call_failed", {
        postId: post.postId,
        provider: post.provider,
        mode,
        durationMs: Date.now() - publishStart,
        ...formatErrorPayload(error),
      });
      return {
        ...post,
        status: "failed",
        error: { code: "PUBLISH_FAILED", message: String(error) },
        updatedAt: nowIso(),
      };
    }
  })();

  await putPost(deps.ddb, deps.tableNames.posts, updated);
  logger.info("publish_post_completed", {
    postId: post.postId,
    provider: post.provider,
    mode,
    status: updated.status,
    errorCode: updated.error?.code,
    durationMs: Date.now() - publishStart,
  });
  return updated;
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
