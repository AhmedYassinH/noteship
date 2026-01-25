import type { LlmClient } from "./types";
import OpenAI from "openai";

export const createOpenAiClient = (apiKey: string): LlmClient => {
  const client = new OpenAI({ apiKey });

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
        "You are a helpful writing assistant that converts notes into social posts.";
      const userPrompt = [
        `Provider: ${provider}`,
        tone ? `Tone: ${tone}` : null,
        language ? `Language: ${language}` : null,
        "Note:",
        noteContent,
        "Output only the post content without quotes or extra commentary.",
      ]
        .filter(Boolean)
        .join("\n");

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
  };
};
