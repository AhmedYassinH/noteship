import type { LlmClient } from "./openai";
import { createOpenAiClient } from "./openai";

export type LlmProvider = "openai";

export const createLlmClient = (provider: LlmProvider, apiKey: string): LlmClient => {
  if (provider === "openai") {
    return createOpenAiClient(apiKey);
  }

  throw new Error(`Unsupported LLM provider: ${provider}`);
};

export type { LlmClient } from "./openai";
