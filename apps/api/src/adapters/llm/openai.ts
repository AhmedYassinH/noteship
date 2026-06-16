import type { LlmClient } from "./types";
import OpenAI from "openai";

export const createOpenAiClient = (apiKey: string): LlmClient => {
  const client = new OpenAI({ apiKey });
  const buildDraftPrompt = (input: {
    provider: "linkedin";
    noteContent: string;
    tone?: string;
    language?: "en" | "ar";
  }): string =>
    [
      `Provider: ${input.provider}`,
      input.tone ? `Tone: ${input.tone}` : null,
      input.language ? `Language: ${input.language}` : null,
      "Constraint: Keep content LinkedIn compatible, plain text, and <= 3000 characters.",
      "Source note:",
      input.noteContent,
      "Output only the post content with no surrounding commentary.",
    ]
      .filter(Boolean)
      .join("\n");

  const buildRegeneratePrompt = (input: {
    provider: "linkedin";
    currentContent: string;
    instruction: string;
    language?: "en" | "ar";
  }): string =>
    [
      `Provider: ${input.provider}`,
      input.language ? `Language: ${input.language}` : null,
      "Constraint: Keep output LinkedIn compatible and <= 3000 characters.",
      "Current draft:",
      input.currentContent,
      "User instruction:",
      input.instruction,
      "Rewrite the draft accordingly and output only the rewritten post content.",
    ]
      .filter(Boolean)
      .join("\n");

  return {
    async embedTexts({ inputs, model }) {
      const result = await client.embeddings.create({
        model,
        input: inputs,
      });

      return result.data.map((item) => item.embedding as number[]);
    },
    async generateDraft({ noteContent, provider, tone, language, model }) {
      const systemPrompt =
        "You rewrite knowledge notes into clear social posts while respecting platform constraints.";
      const userPrompt = buildDraftPrompt({ noteContent, provider, tone, language });

      const response = await client.chat.completions.create({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("OpenAI did not return draft content");
      }

      return content;
    },
    async regenerateDraft({ provider, currentContent, instruction, language, model }) {
      const response = await client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content:
              "You are a senior social copy editor. Preserve intent, improve clarity, and obey constraints.",
          },
          {
            role: "user",
            content: buildRegeneratePrompt({
              provider,
              currentContent,
              instruction,
              language,
            }),
          },
        ],
        temperature: 0.6,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error("OpenAI did not return regenerated draft content");
      }

      return content;
    },
  };
};
