import { tokenize } from "@/lib/parsing/sections";

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export function cosineSimilarity(a: number[], b: number[]) {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let index = 0; index < a.length; index += 1) {
    dot += a[index] * b[index];
    normA += a[index] * a[index];
    normB += b[index] * b[index];
  }

  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export function lexicalSimilarity(resumeText: string, jobText: string) {
  const resumeTokens = tokenize(resumeText);
  const jobTokens = tokenize(jobText);

  if (!resumeTokens.length || !jobTokens.length) return 35;

  const counts = (tokens: string[]) => {
    const map = new Map<string, number>();
    tokens.forEach((token) => map.set(token, (map.get(token) ?? 0) + 1));
    return map;
  };

  const resumeCounts = counts(resumeTokens);
  const jobCounts = counts(jobTokens);

  let dot = 0;
  let resumeNorm = 0;
  let jobNorm = 0;

  for (const [token, count] of resumeCounts) {
    resumeNorm += count * count;
    const jobCount = jobCounts.get(token);
    if (jobCount) dot += count * jobCount;
  }

  for (const count of jobCounts.values()) {
    jobNorm += count * count;
  }

  if (!resumeNorm || !jobNorm) return 35;
  const cosine = dot / (Math.sqrt(resumeNorm) * Math.sqrt(jobNorm));
  return Math.round(clamp(cosine * 180, 20, 96));
}

export function calibrateEmbeddingSimilarity(similarity: number) {
  return Math.round(clamp(((similarity - 0.38) / 0.45) * 100, 15, 98));
}

export function chunkText(
  text: string,
  maxChars = 650,
  maxChunks = 36,
): string[] {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const chunks: string[] = [];
  let buffer = "";

  const pushBuffer = () => {
    if (buffer.trim().length >= 40) chunks.push(buffer.trim());
    buffer = "";
  };

  for (const line of lines) {
    if (line.length > maxChars) {
      const sentences = line.split(/(?<=[.!?])\s+/);
      for (const sentence of sentences) {
        if ((buffer + " " + sentence).length > maxChars) pushBuffer();
        buffer = buffer ? `${buffer} ${sentence}` : sentence;
      }
    } else if ((buffer + " " + line).length > maxChars) {
      pushBuffer();
      buffer = line;
    } else {
      buffer = buffer ? `${buffer}\n${line}` : line;
    }

    if (chunks.length >= maxChunks) break;
  }

  pushBuffer();
  return chunks.slice(0, maxChunks);
}
