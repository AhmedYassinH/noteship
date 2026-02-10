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

const nowIso = (): string => new Date().toISOString();

type StoredConnectorCredentials = {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: string;
  refreshTokenExpiresAt?: string;
};

export const publishPost = async (
  deps: Deps,
  input: { userId: string; postId: string; mode?: "single" | "overflow_comments" },
): Promise<Post> => {
  const post = await getPostById(deps.ddb, deps.tableNames.posts, input.userId, input.postId);
  if (!post) {
    throw new Error("Post not found");
  }

  if (post.status === "published") {
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

  if (!account || !encryptedCredentials) {
    const failed: Post = {
      ...post,
      status: "failed",
      error: { code: "NO_INTEGRATION", message: "Integration not connected" },
      updatedAt: nowIso(),
    };
    await putPost(deps.ddb, deps.tableNames.posts, failed);
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
    return failed;
  }

  const content = post.contentS3Key
    ? await getObjectString(deps.s3, deps.bucketName, post.contentS3Key)
    : "";
  const mode = input.mode ?? post.publishMode ?? "single";

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

          const root = await connector.publishPost({
            accountId: accountTarget,
            accessToken: credentials.accessToken,
            content: overflow.root,
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
          await connector.publishPost({
            accountId: accountTarget,
            accessToken: credentials.accessToken,
            content: normalized,
          });
        }
      } else {
        await connector.publishPost({
          accountId: accountTarget,
          accessToken: credentials.accessToken,
          content,
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
      return {
        ...post,
        status: "failed",
        error: { code: "PUBLISH_FAILED", message: String(error) },
        updatedAt: nowIso(),
      };
    }
  })();

  await putPost(deps.ddb, deps.tableNames.posts, updated);
  return updated;
};

export const dispatchScheduledPosts = async (deps: Deps): Promise<number> => {
  const now = nowIso();
  const posts = await listScheduledPostsDue(deps.ddb, deps.tableNames.posts, now);

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

  return posts.length;
};
