import type {
  AnalysisResult,
  ParsedJob,
  ResumeMetrics,
} from "@/lib/types";
import { buildResumeMetrics, parseSections, redactPII } from "@/lib/parsing/sections";
import { inferJobFromText } from "@/lib/parsing/jd-heuristics";
import { scoreResume, type DeterministicResult } from "@/lib/scoring/engine";
import {
  calibrateEmbeddingSimilarity,
  chunkText,
  cosineSimilarity,
  lexicalSimilarity,
} from "@/lib/scoring/semantic";
import { embedTexts } from "@/lib/ai/client";
import { isAiConfigured } from "@/lib/ai/config";
import { generateFeedback } from "@/lib/ai";
import { mockFeedback } from "@/lib/ai/mock";
import type { FeedbackOutput } from "@/lib/ai/schemas";
import { scoreBand } from "@/lib/utils";

export interface RunAnalysisInput {
  id?: string;
  createdAt?: string;
  resume: {
    id?: string;
    title: string;
    fileName: string;
    text: string;
    fileType?: string | null;
  };
  job: {
    id?: string;
    text: string;
    title?: string | null;
    company?: string | null;
    sourceUrl?: string | null;
  };
  includeFeedback?: boolean;
  semanticScore?: number | null;
}

export interface RunAnalysisOutput {
  result: AnalysisResult;
  parsedJob: ParsedJob;
  sections: Record<string, string>;
  metrics: ResumeMetrics;
  deterministic: DeterministicResult;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

export async function computeSemanticScore(
  resumeText: string,
  jobText: string,
): Promise<number> {
  const lexical = lexicalSimilarity(resumeText, jobText);

  if (!isAiConfigured()) return lexical;

  try {
    const resumeChunks = chunkText(resumeText, 600, 10);
    const jobChunks = chunkText(jobText, 700, 5);

    if (!resumeChunks.length || !jobChunks.length) return lexical;

    const vectors = await embedTexts([...resumeChunks, ...jobChunks]);
    const resumeVectors = vectors.slice(0, resumeChunks.length);
    const jobVectors = vectors.slice(resumeChunks.length);

    if (!resumeVectors.length || !jobVectors.length) return lexical;

    const bestMatches = jobVectors.map((jobVector) =>
      Math.max(
        ...resumeVectors.map((resumeVector) =>
          cosineSimilarity(jobVector, resumeVector),
        ),
      ),
    );

    const average =
      bestMatches.reduce((sum, value) => sum + value, 0) / bestMatches.length;

    return calibrateEmbeddingSimilarity(average);
  } catch (error) {
    console.error(
      "Embedding similarity failed; using lexical fallback:",
      error instanceof Error ? error.message : error,
    );
    return lexical;
  }
}

function mergeSectionFeedback(
  feedback: FeedbackOutput,
  sectionScores: Record<string, number>,
) {
  const entries = Object.entries(sectionScores);

  return feedback.sectionFeedback.map((item) => {
    const match = entries.find(([key]) => {
      const left = key.toLowerCase();
      const right = item.section.toLowerCase();
      return left === right || right.includes(left) || left.includes(right);
    });

    return {
      ...item,
      score: match ? match[1] : Math.round(clamp(item.score)),
    };
  });
}

export async function runAnalysis(
  input: RunAnalysisInput,
): Promise<RunAnalysisOutput> {
  const sectionsResult = parseSections(input.resume.text);
  const metrics = buildResumeMetrics(input.resume.text, sectionsResult.sections);

  const parsedJob = inferJobFromText({
    text: input.job.text,
    title: input.job.title,
    company: input.job.company,
    sourceUrl: input.job.sourceUrl,
  });

  const semanticScore =
    typeof input.semanticScore === "number"
      ? Math.round(clamp(input.semanticScore))
      : await computeSemanticScore(input.resume.text, input.job.text);

  const deterministic = scoreResume({
    resumeText: input.resume.text,
    sections: sectionsResult.sections,
    metrics,
    job: parsedJob,
    semanticScore,
    fileType: input.resume.fileType,
  });

  const redactedResume = redactPII(input.resume.text);

  let feedback: FeedbackOutput;
  let aiFallback = false;
  let model = "rolefit-local";

  if (input.includeFeedback === false) {
    feedback = mockFeedback({
      job: parsedJob,
      metrics,
      scores: deterministic,
      resumeTitle: input.resume.title,
      resumeText: input.resume.text,
    });
  } else {
    const generation = await generateFeedback({
      job: parsedJob,
      metrics,
      scores: deterministic,
      resumeTitle: input.resume.title,
      resumeText: redactedResume,
      ats: deterministic.ats,
    });

    feedback = generation.feedback;
    aiFallback = generation.fallback;
    model = generation.model;
  }

  const id = input.id ?? crypto.randomUUID();
  const createdAt = input.createdAt ?? new Date().toISOString();

  const result: AnalysisResult = {
    id,
    createdAt,
    resume: {
      id: input.resume.id,
      title: input.resume.title,
      fileName: input.resume.fileName,
      wordCount: metrics.wordCount,
    },
    job: {
      id: input.job.id,
      title: parsedJob.title,
      company: parsedJob.company,
      sourceUrl: parsedJob.sourceUrl ?? null,
    },
    overallScore: deterministic.overallScore,
    scores: deterministic.scores,
    verdict: scoreBand(deterministic.overallScore).label,
    summary: feedback.summary,
    skills: deterministic.skills,
    keywords: deterministic.keywords,
    ats: deterministic.ats,
    strengths: feedback.strengths,
    gaps: feedback.gaps,
    sectionFeedback: mergeSectionFeedback(feedback, deterministic.sectionScores),
    bulletRewrites: feedback.bulletRewrites,
    suggestedSummary: feedback.suggestedSummary,
    interviewQuestions: feedback.interviewQuestions,
    model,
    aiFallback,
  };

  return {
    result,
    parsedJob,
    sections: sectionsResult.sections,
    metrics,
    deterministic,
  };
}
