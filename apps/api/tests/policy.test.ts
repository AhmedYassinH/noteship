import { describe, expect, it } from "vitest";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import type { Deps } from "../src/runtime/deps";
import { can } from "../src/use-cases/policy";

const createDeps = (send: DynamoDBDocumentClient["send"]): Deps =>
  ({
    ddb: { send } as DynamoDBDocumentClient,
    tableNames: {
      users: "Users",
      notes: "Notes",
      posts: "Posts",
      integrations: "Integrations",
      usage: "Usage",
      jobs: "Jobs",
      rateLimits: "RateLimits",
      uploadLeases: "UploadLeases",
    },
  }) as Deps;

describe("API policy", () => {
  it("denies scheduling for effective free users", async () => {
    const deps = createDeps(async () => ({
      Item: {
        userId: "u1",
        email: "user@example.com",
        createdAt: "2026-01-01T00:00:00.000Z",
        planId: "free",
      },
    }));

    await expect(can(deps, "u1", "post.schedule")).resolves.toMatchObject({
      ok: false,
      code: "FEATURE_NOT_AVAILABLE",
    });
  });

  it("reports rate-limit denials from atomic bucket updates", async () => {
    const deps = createDeps(async (command) => {
      if (command.constructor.name === "GetCommand") {
        return { Item: undefined };
      }
      const error = new Error("conditional failure");
      error.name = "ConditionalCheckFailedException";
      throw error;
    });

    await expect(can(deps, "u1", "api.request")).resolves.toMatchObject({
      ok: false,
      code: "RATE_LIMITED",
    });
  });
});
