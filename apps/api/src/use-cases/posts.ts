import { randomUUID } from "node:crypto";
import type { Post } from "@noteship/domain";
import { getPostById, listPosts, putPost } from "../adapters/dynamodb/posts";
import { getNoteById } from "../adapters/dynamodb/notes";
import { putObjectString } from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { badRequest, notFound } from "../runtime/errors";
import { buildPostDraftKey } from "@noteship/utils";
import {
  FEATURE_KEYS,
  assertBooleanEntitlement,
  getUsagePeriodStart,
  incrementUsageForField,
  requireUser,
  resolvePlanForUser,
} from "./entitlements";

const nowIso = (): string => new Date().toISOString();

export const createPost = async (
  deps: Deps,
  userId: string,
  input: {
    noteId: string;
    provider: "linkedin" | "medium";
    content?: string;
  },
): Promise<Post> => {
  if (!input.content) {
    throw badRequest("content is required for MVP");
  }

  const note = await getNoteById(deps.ddb, deps.tableNames.notes, userId, input.noteId);
  if (!note) {
    throw notFound("Note not found");
  }

  const postId = randomUUID();
  const s3Key = buildPostDraftKey(userId, postId);
  const now = nowIso();

  const post: Post = {
    userId,
    postId,
    noteId: input.noteId,
    provider: input.provider,
    status: "draft",
    contentS3Key: s3Key,
    createdAt: now,
    updatedAt: now,
  };

  await putObjectString(deps.s3, deps.bucketName, s3Key, input.content);
  await putPost(deps.ddb, deps.tableNames.posts, post);

  return post;
};

export const listPostsForUser = async (
  deps: Deps,
  userId: string,
  status?: Post["status"],
  limit?: number,
  cursor?: string,
): Promise<{ items: Post[]; nextCursor?: string }> =>
  listPosts(deps.ddb, deps.tableNames.posts, userId, status, limit, cursor);

export const publishPostNow = async (deps: Deps, userId: string, postId: string): Promise<Post> => {
  const post = await getPostById(deps.ddb, deps.tableNames.posts, userId, postId);
  if (!post) {
    throw notFound("Post not found");
  }

  const updated: Post = {
    ...post,
    status: "queued",
    updatedAt: nowIso(),
  };

  await putPost(deps.ddb, deps.tableNames.posts, updated);
  await enqueueJob(deps.sqs, deps.jobsQueueUrl, {
    jobId: randomUUID(),
    type: "PUBLISH_POST",
    userId,
    createdAt: nowIso(),
    payload: {
      postId,
    },
  });

  return updated;
};

export const schedulePost = async (
  deps: Deps,
  userId: string,
  postId: string,
  scheduledAt: string,
): Promise<Post> => {
  const user = await requireUser(deps, userId);
  const plan = resolvePlanForUser(user);
  assertBooleanEntitlement(plan, FEATURE_KEYS.scheduledPublish);

  const post = await getPostById(deps.ddb, deps.tableNames.posts, userId, postId);
  if (!post) {
    throw notFound("Post not found");
  }

  const updated: Post = {
    ...post,
    status: "scheduled",
    scheduledAt,
    updatedAt: nowIso(),
  };

  await putPost(deps.ddb, deps.tableNames.posts, updated);

  const periodStart = getUsagePeriodStart(user);
  await incrementUsageForField(deps, userId, periodStart, "scheduledPostsUsed");

  return updated;
};

export const cancelScheduledPost = async (
  deps: Deps,
  userId: string,
  postId: string,
): Promise<Post> => {
  const post = await getPostById(deps.ddb, deps.tableNames.posts, userId, postId);
  if (!post) {
    throw notFound("Post not found");
  }

  const updated: Post = {
    ...post,
    status: "draft",
    scheduledAt: undefined,
    updatedAt: nowIso(),
  };

  await putPost(deps.ddb, deps.tableNames.posts, updated);
  return updated;
};
