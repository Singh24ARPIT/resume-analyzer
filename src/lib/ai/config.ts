const apiKey = process.env.GEMINI_API_KEY?.trim();

export const geminiConfig = {
  apiKey,
  model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
  embeddingModel:
    process.env.GEMINI_EMBEDDING_MODEL?.trim() || "gemini-embedding-001",
  timeoutMs: 45_000,
};

export function isAiConfigured() {
  return Boolean(geminiConfig.apiKey) && process.env.MOCK_AI !== "1";
}

export function isMockAi() {
  return !isAiConfigured();
}

export function aiModeLabel() {
  if (!isAiConfigured()) return "local-scoring";
  return geminiConfig.model;
}
