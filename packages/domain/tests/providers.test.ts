import { describe, expect, it } from "vitest";
import {
  apiIntegrationProviderSchema,
  apiPostProviderSchema,
  createPostSchema,
  draftCreateRequestSchema,
  integrationProviderSchema,
  postProviderSchema,
} from "../src";

describe("provider schemas", () => {
  it("accepts LinkedIn as the only launch provider", () => {
    expect(postProviderSchema.parse("linkedin")).toBe("linkedin");
    expect(apiPostProviderSchema.parse("linkedin")).toBe("linkedin");
    expect(integrationProviderSchema.parse("linkedin")).toBe("linkedin");
    expect(apiIntegrationProviderSchema.parse("linkedin")).toBe("linkedin");
  });

  it("hard rejects Medium across public API schemas", () => {
    expect(() => postProviderSchema.parse("medium")).toThrow();
    expect(() => apiPostProviderSchema.parse("medium")).toThrow();
    expect(() => integrationProviderSchema.parse("medium")).toThrow();
    expect(() => apiIntegrationProviderSchema.parse("medium")).toThrow();
    expect(() =>
      draftCreateRequestSchema.parse({
        provider: "medium",
      }),
    ).toThrow();
    expect(() =>
      createPostSchema.parse({
        noteId: "note_1",
        provider: "medium",
        content: "Draft",
      }),
    ).toThrow();
  });
});
