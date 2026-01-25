import { createConnector } from "@noteship/connectors";
import type { Post } from "@noteship/domain";
import { getPostById, listScheduledPostsDue, putPost } from "../adapters/dynamodb/posts";
import { listIntegrationsForProvider } from "../adapters/dynamodb/integrations";
import { getObjectString } from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { randomUUID } from "node:crypto";

const nowIso = (): string => new Date().toISOString();

export const publishPost = async (
  deps: Deps,
  input: { userId: string; postId: string },
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

  const tokenRef = account?.tokenRef;
  if (!tokenRef) {
    const failed: Post = {
      ...post,
      status: "failed",
      error: { code: "NO_INTEGRATION", message: "Integration not connected" },
      updatedAt: nowIso(),
    };
    await putPost(deps.ddb, deps.tableNames.posts, failed);
    return failed;
  }

  const content = post.contentS3Key
    ? await getObjectString(deps.s3, deps.bucketName, post.contentS3Key)
    : "";

  const connectorConfig = deps.connectors[post.provider];
  const connector = createConnector(post.provider, {
    clientId: connectorConfig.clientId,
    clientSecret: connectorConfig.clientSecret,
  });

  const updated = await (async (): Promise<Post> => {
    try {
      await connector.publishPost({
        accountId: account.accountId,
        accessToken: tokenRef,
        content,
      });

      return {
        ...post,
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
        payload: { postId: post.postId },
      }),
    ),
  );

  return posts.length;
};
