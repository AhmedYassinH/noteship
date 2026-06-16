import { describe, expect, it } from "vitest";
import { buildNoteArtifactKey, buildTemporaryNoteArtifactKey } from "../src";

describe("S3 key helpers", () => {
  it("keeps temporary note uploads outside the canonical user content prefix", () => {
    expect(buildTemporaryNoteArtifactKey("user-1", "note-1", "artifact-1", "png")).toBe(
      "uploads/tmp/users/user-1/notes/note-1/artifacts/artifact-1.png",
    );
    expect(buildNoteArtifactKey("user-1", "note-1", "artifact-1", "png")).toBe(
      "users/user-1/notes/note-1/artifacts/artifact-1.png",
    );
  });
});
