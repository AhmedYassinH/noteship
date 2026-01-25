export type LlmClient = {
  embedTexts: (input: { inputs: string[]; model: string }) => Promise<number[][]>;
  generateDraft: (input: {
    noteContent: string;
    provider: "linkedin" | "medium";
    tone?: string;
    language?: "en" | "ar";
    model: string;
  }) => Promise<string>;
};
