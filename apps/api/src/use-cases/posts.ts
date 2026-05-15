import { randomUUID } from "node:crypto";
import {
  extractLinkedInMediaFromMarkdown,
  normalizeLinkedInContent,
  splitLinkedInOverflowToComments,
  validateLinkedInContent,
  validateLinkedInMediaManifest,
} from "@noteship/connectors";
import type { LinkedInResolvedMediaManifest } from "@noteship/connectors";
import type { LinkedInPublishPayload, Post } from "@noteship/domain";
import { getPostById, listPosts, putPost } from "../adapters/dynamodb/posts";
import { getNoteById } from "../adapters/dynamodb/notes";
import { getObjectString, putObjectJson, putObjectString } from "../adapters/s3";
import { enqueueJob } from "../adapters/sqs";
import type { Deps } from "../runtime/deps";
import { HttpError, badRequest, notFound } from "../runtime/errors";
import { buildPostDraftKey, buildPostPayloadKey } from "@noteship/utils";
import {
  FEATURE_KEYS,
  assertBooleanEntitlement,
  getUsagePeriodStart,
  incrementUsageForField,
  requireUser,
  resolvePlanForUser,
} from "./entitlements";

const nowIso = (): string => new Date().toISOString();

const resolveArtifactS3Key = (value: string, userId: string, noteId: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const byPath = (pathValue: string): string | null => {
    const path = decodeURIComponent(pathValue).replace(/^\/+/, "");
    if (!path.startsWith(`users/${userId}/`)) return null;
    if (!path.includes(`/notes/${noteId}/artifacts/`)) return null;
    return path;
  };

  if (trimmed.startsWith("users/")) {
    return byPath(trimmed);
  }

  try {
    const parsed = new URL(trimmed);
    return byPath(parsed.pathname);
  } catch {
    return null;
  }
};

const resolveLinkedInPayloadMedia = (
  media: LinkedInResolvedMediaManifest,
  userId: string,
  noteId: string,
): LinkedInPublishPayload["media"] => {
  if (media.type === "none") {
    return { type: "none" };
  }

  if (media.type === "images") {
    const images = media.images.map((image) => {
      const s3Key = resolveArtifactS3Key(image.url, userId, noteId);
      if (!s3Key) {
        throw new HttpError(
          400,
          "LINKEDIN_MEDIA_INVALID",
          "Only images embedded from this note can be published to LinkedIn.",
        );
      }

      return {
        s3Key,
        altText: image.altText,
      };
    });

    return {
      type: "images",
      images,
    };
  }

  const s3Key = resolveArtifactS3Key(media.pdf.url, userId, noteId);
  if (!s3Key) {
    throw new HttpError(
      400,
      "LINKEDIN_MEDIA_INVALID",
      "Only PDFs embedded from this note can be published to LinkedIn.",
    );
  }

  return {
    type: "pdf",
    pdf: {
      s3Key,
      title: media.pdf.title,
    },
  };
};

const validateLinkedInDraft = async (
  deps: Deps,
  post: Post,
): Promise<{
  normalized: string;
  mode: "single" | "overflow_comments";
  payload: LinkedInPublishPayload;
}> => {
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

  const extractedMedia = extractLinkedInMediaFromMarkdown(content);
  const mediaValidation = validateLinkedInMediaManifest(
    extractedMedia,
    deps.linkedin.maxImagesPerPost,
  );
  if (!mediaValidation.ok) {
    throw new HttpError(400, mediaValidation.code, mediaValidation.message);
  }

  const payloadMedia = resolveLinkedInPayloadMedia(mediaValidation.media, post.userId, post.noteId);
  if (mode === "overflow_comments" && payloadMedia.type === "pdf") {
    throw new HttpError(
      400,
      "LINKEDIN_MEDIA_INVALID",
      "Overflow comments mode is not supported when publishing a PDF document.",
    );
  }

  return {
    normalized,
    mode,
    payload: {
      version: 1,
      provider: "linkedin",
      mode,
      normalizedContent: normalized,
      media: payloadMedia,
    },
  };
};

const persistLinkedInPayload = async (
  deps: Deps,
  post: Post,
  payload: LinkedInPublishPayload,
): Promise<void> => {
  const payloadKey = buildPostPayloadKey(post.userId, post.provider, post.postId);
  await putObjectJson(
    deps.s3,
    deps.bucketName,
    payloadKey,
    payload as unknown as Record<string, unknown>,
  );
};

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
  let linkedInPayload: LinkedInPublishPayload | undefined;

  if (post.provider === "linkedin") {
    const validated = await validateLinkedInDraft(deps, { ...post, publishMode: mode });
    normalizedContent = validated.normalized;
    linkedInPayload = validated.payload;
  }

  if (normalizedContent) {
    await putObjectString(deps.s3, deps.bucketName, post.contentS3Key, normalizedContent);
  }

  if (linkedInPayload) {
    await persistLinkedInPayload(deps, post, linkedInPayload);
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

  const mode = input?.mode ?? post.publishMode ?? "single";

  if (post.provider === "linkedin") {
    const validated = await validateLinkedInDraft(deps, { ...post, publishMode: mode });
    if (post.contentS3Key) {
      await putObjectString(deps.s3, deps.bucketName, post.contentS3Key, validated.normalized);
    }
    await persistLinkedInPayload(deps, post, validated.payload);
  }

  const updated: Post = {
    ...post,
    publishMode: mode,
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
