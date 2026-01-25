import OpenAI from "openai";

export type LlmClient = {
  embedTexts: (input: { inputs: string[]; model: string }) => Promise<number[][]>;
};

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
  };
};
