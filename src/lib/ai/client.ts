import type { z } from "zod";
import { geminiConfig } from "@/lib/ai/config";

export class GeminiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiError";
  }
}

type GeminiResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  error?: { message?: string };
  embeddings?: Array<{ values?: number[] }>;
};

async function geminiFetch(path: string, body: unknown) {
  if (!geminiConfig.apiKey) {
    throw new GeminiError("GEMINI_API_KEY is not configured.");
  }

  let response: Response;
  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${path}?key=${encodeURIComponent(geminiConfig.apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(geminiConfig.timeoutMs),
      },
    );
  } catch {
    throw new GeminiError("Gemini request timed out or could not be reached.");
  }

  const text = await response.text();
  let data: GeminiResponse;
  try {
    data = JSON.parse(text) as GeminiResponse;
  } catch {
    throw new GeminiError(`Gemini returned an unreadable response (${response.status}).`);
  }

  if (!response.ok) {
    const detail = data.error?.message || `HTTP ${response.status}`;
    if (response.status === 429) {
      throw new GeminiError(
        "Gemini's rate limit was reached. Wait a moment and try again, or check your API quota.",
      );
    }
    throw new GeminiError(`Gemini request failed: ${detail}`);
  }

  return data;
}

function extractJson(raw: string) {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return candidate;
  return candidate.slice(start, end + 1);
}

async function callGemini(system: string, prompt: string, temperature = 0.25) {
  const data = await geminiFetch(
    `${geminiConfig.model}:generateContent`,
    {
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature,
        topP: 0.9,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    },
  );

  const text =
    data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("\n")
      .trim() ?? "";

  if (!text) {
    throw new GeminiError("Gemini returned an empty response.");
  }

  return text;
}

export async function generateStructured<T>({
  system,
  prompt,
  schema,
}: {
  system: string;
  prompt: string;
  schema: z.ZodType<T>;
}): Promise<T> {
  let raw = await callGemini(system, prompt);
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const parsed = JSON.parse(extractJson(raw)) as unknown;
      return schema.parse(parsed);
    } catch (error) {
      lastError = error;
      if (attempt === 0) {
        raw = await callGemini(
          system,
          `${prompt}\n\nYour previous response did not match the required JSON. Return only a valid JSON object with every required field. Do not include markdown fences or commentary.`,
          0.1,
        );
      }
    }
  }

  throw new GeminiError(
    `Gemini could not produce valid structured output: ${
      lastError instanceof Error ? lastError.message : "unknown error"
    }`,
  );
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (!texts.length) return [];

  const vectors: number[][] = [];
  const batchSize = 16;

  for (let start = 0; start < texts.length; start += batchSize) {
    const batch = texts.slice(start, start + batchSize);
    const data = await geminiFetch(
      `${geminiConfig.embeddingModel}:batchEmbedContents`,
      {
        requests: batch.map((text) => ({
          model: `models/${geminiConfig.embeddingModel}`,
          content: { parts: [{ text }] },
          taskType: "SEMANTIC_SIMILARITY",
        })),
      },
    );

    const embeddings = data.embeddings ?? [];
    if (embeddings.length !== batch.length) {
      throw new GeminiError("Gemini returned an incomplete embedding batch.");
    }

    for (const embedding of embeddings) {
      if (!embedding.values?.length) {
        throw new GeminiError("Gemini returned an empty embedding.");
      }
      vectors.push(embedding.values);
    }
  }

  return vectors;
}
