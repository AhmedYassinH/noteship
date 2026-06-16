import { describe, expect, it, vi } from "vitest";
import type { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { decrementUserCounter } from "../src/adapters/dynamodb/users";

describe("worker user counters", () => {
  it("ignores duplicate scheduled-capacity releases", async () => {
    const send = vi.fn(async () => {
      const error = new Error("conditional failure");
      error.name = "ConditionalCheckFailedException";
      throw error;
    });

    await expect(
      decrementUserCounter(
        { send } as unknown as DynamoDBDocumentClient,
        "Users",
        "u1",
        "activeScheduledPosts",
      ),
    ).resolves.toBeUndefined();
  });
});
