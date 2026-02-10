import { randomUUID } from "node:crypto";
import {
  normalizeLinkedInContent,
  splitLinkedInOverflowToComments,
  validateLinkedInContent,
} from "@noteship/connectors";
import type { Post } from "@noteship/domain";
import { getPostById, listPosts, putPost } from "../adapters/dynamodb/posts";
import { getNoteById } from "../adapters/dynamodb/notes";
import { getObjectString, putObjectString } from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { HttpError, badRequest, notFound } from "../runtime/errors";
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
    mode?: "single" | "overflow_comments";
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
  const s3Key = buildPostDraftKey(userId, input.provider, postId);
  const now = nowIso();

  const post: Post = {
    userId,
    postId,
    noteId: input.noteId,
    provider: input.provider,
    publishMode: input.mode ?? "single",
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

const validateLinkedInDraft = async (
  deps: Deps,
  post: Post,
): Promise<{ normalized: string; mode: "single" | "overflow_comments" }> => {
  const content = post.contentS3Key
    ? await getObjectString(deps.s3, deps.bucketName, post.contentS3Key)
    : "";
  const normalized = normalizeLinkedInContent(content);
  const mode = post.publishMode ?? "single";
  const validation = validateLinkedInContent(normalized, deps.linkedin.textMaxChars);

  if (!validation.ok && validation.charCount === 0) {
    throw new HttpError(400, "LINKEDIN_CONTENT_INVALID", validation.reason);
  }

  if (!validation.ok && mode === "single") {
    throw new HttpError(
      400,
      "LINKEDIN_TOO_LONG",
      `${validation.reason} Choose overflow comments mode or shorten the draft.`,
    );
  }

  if (mode === "overflow_comments") {
    try {
      splitLinkedInOverflowToComments(
        normalized,
        deps.linkedin.textMaxChars,
        deps.linkedin.commentMaxChars,
      );
    } catch (error) {
      throw new HttpError(400, "LINKEDIN_CONTENT_INVALID", String(error));
    }
  }

  return { normalized, mode };
};

export const savePostDraft = async (
  deps: Deps,
  userId: string,
  postId: string,
  input: { content: string; mode?: "single" | "overflow_comments" },
): Promise<Post> => {
  const post = await getPostById(deps.ddb, deps.tableNames.posts, userId, postId);
  if (!post) {
    throw notFound("Post not found");
  }

  const s3Key = post.contentS3Key ?? buildPostDraftKey(userId, post.provider, postId);
  const updated: Post = {
    ...post,
    contentS3Key: s3Key,
    publishMode: input.mode ?? post.publishMode ?? "single",
    updatedAt: nowIso(),
  };

  await putObjectString(deps.s3, deps.bucketName, s3Key, input.content);
  await putPost(deps.ddb, deps.tableNames.posts, updated);
  return updated;
};

export const publishPostNow = async (
  deps: Deps,
  userId: string,
  postId: string,
  input?: { mode?: "single" | "overflow_comments" },
): Promise<Post> => {
  const post = await getPostById(deps.ddb, deps.tableNames.posts, userId, postId);
  if (!post) {
    throw notFound("Post not found");
  }
  if (!post.contentS3Key) {
    throw badRequest("Post content is missing");
  }

  const mode = input?.mode ?? post.publishMode ?? "single";
  let normalizedContent: string | undefined;
  if (post.provider === "linkedin") {
    const validated = await validateLinkedInDraft(deps, { ...post, publishMode: mode });
    normalizedContent = validated.normalized;
  }

  if (normalizedContent) {
    await putObjectString(deps.s3, deps.bucketName, post.contentS3Key, normalizedContent);
  }

  const updated: Post = {
    ...post,
    publishMode: mode,
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
      mode,
    },
  });

  return updated;
};

export const schedulePost = async (
  deps: Deps,
  userId: string,
  postId: string,
  scheduledAt: string,
  input?: { timezone?: string; mode?: "single" | "overflow_comments" },
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
    publishMode: input?.mode ?? post.publishMode ?? "single",
    status: "scheduled",
    scheduledAt,
    scheduledTimezone: input?.timezone ?? user.timezone ?? "UTC",
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
    scheduledTimezone: undefined,
    updatedAt: nowIso(),
  };

  await putPost(deps.ddb, deps.tableNames.posts, updated);
  return updated;
};
