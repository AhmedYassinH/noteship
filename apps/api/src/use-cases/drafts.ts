import { randomUUID } from "node:crypto";
import type { Post } from "@noteship/domain";
import { getNoteById } from "../adapters/dynamodb/notes";
import { putPost } from "../adapters/dynamodb/posts";
import { getObjectString, putObjectString } from "../adapters/s3";
import type { Deps } from "../runtime/deps";
import { notFound } from "../runtime/errors";
import { buildPostDraftKey } from "@noteship/utils";
import { FEATURE_KEYS, assertQuotaEntitlement, incrementUsageForField } from "./entitlements";

const nowIso = (): string => new Date().toISOString();

export const generateDrafts = async (
  deps: Deps,
  userId: string,
  noteId: string,
  input: {
    provider: "linkedin" | "medium";
    tone?: string;
    language?: "en" | "ar";
  },
): Promise<{ drafts: { post: Post; content: string }[] }> => {
  const note = await getNoteById(deps.ddb, deps.tableNames.notes, userId, noteId);
  if (!note) {
    throw notFound("Note not found");
  }

  const { periodStart } = await assertQuotaEntitlement(
    deps,
    userId,
    FEATURE_KEYS.aiGenerationsPerMonth,
    "aiGenerationsUsed",
  );

  const noteContent = await getObjectString(deps.s3, deps.bucketName, note.s3Key);
  const generated = await deps.llm.generateDraft({
    noteContent,
    provider: input.provider,
    tone: input.tone,
    language: input.language,
    model: deps.llmModels.draft,
  });

  const postId = randomUUID();
  const now = nowIso();
  const s3Key = buildPostDraftKey(userId, postId);

  const post: Post = {
    userId,
    postId,
    noteId,
    provider: input.provider,
    status: "draft",
    contentS3Key: s3Key,
    createdAt: now,
    updatedAt: now,
  };

  await putObjectString(deps.s3, deps.bucketName, s3Key, generated);
  await putPost(deps.ddb, deps.tableNames.posts, post);
  await incrementUsageForField(deps, userId, periodStart, "aiGenerationsUsed");

  return {
    drafts: [{ post, content: generated }],
  };
};
