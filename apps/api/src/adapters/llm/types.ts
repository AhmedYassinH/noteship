export type LlmClient = {
  embedTexts: (_input: { inputs: string[]; model: string }) => Promise<number[][]>;
  generateDraft: (_input: {
    noteContent: string;
    provider: "linkedin" | "medium";
    tone?: string;
    language?: "en" | "ar";
    model: string;
  }) => Promise<string>;
  regenerateDraft: (_input: {
    provider: "linkedin" | "medium";
    currentContent: string;
    instruction: string;
    language?: "en" | "ar";
    model: string;
  }) => Promise<string>;
};
