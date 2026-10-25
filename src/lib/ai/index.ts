import { geminiConfig, isAiConfigured } from "@/lib/ai/config";
import { generateStructured } from "@/lib/ai/client";
import {
  comparisonVerdictSchema,
  coverLetterSchema,
  feedbackSchema,
  type CoverLetterOutput,
  type FeedbackOutput,
} from "@/lib/ai/schemas";
import {
  mockComparisonVerdict,
  mockCoverLetter,
  mockFeedback,
} from "@/lib/ai/mock";
import {
  buildComparisonPrompt,
  buildCoverLetterPrompt,
  buildFeedbackPrompt,
  COMPARISON_SYSTEM,
  COVER_LETTER_SYSTEM,
  FEEDBACK_SYSTEM,
  type FeedbackPromptInput,
} from "@/lib/ai/prompts";

export interface FeedbackGeneration {
  feedback: FeedbackOutput;
  fallback: boolean;
  model: string;
}

export async function generateFeedback(
  input: FeedbackPromptInput,
): Promise<FeedbackGeneration> {
  if (!isAiConfigured()) {
    return {
      feedback: mockFeedback(input),
      fallback: false,
      model: "resume-analyzer-local",
    };
  }

  try {
    const feedback = await generateStructured({
      system: FEEDBACK_SYSTEM,
      prompt: buildFeedbackPrompt(input),
      schema: feedbackSchema,
    });

    return {
      feedback,
      fallback: false,
      model: geminiConfig.model,
    };
  } catch (error) {
    console.error(
      "Gemini feedback failed; using local template:",
      error instanceof Error ? error.message : error,
    );

    return {
      feedback: mockFeedback(input),
      fallback: true,
      model: "resume-analyzer-local",
    };
  }
}

export interface CoverLetterGeneration {
  letter: CoverLetterOutput;
  fallback: boolean;
  model: string;
}

export async function generateCoverLetter(input: {
  candidateName: string;
  tone: "professional" | "enthusiastic" | "concise";
  jobTitle: string;
  company: string;
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  evidence: string[];
  summary: string;
  analysis: Parameters<typeof buildCoverLetterPrompt>[0]["analysis"];
  jobText?: string;
}): Promise<CoverLetterGeneration> {
  if (!isAiConfigured()) {
    return {
      letter: mockCoverLetter(input),
      fallback: false,
      model: "resume-analyzer-local",
    };
  }

  try {
    const letter = await generateStructured({
      system: COVER_LETTER_SYSTEM,
      prompt: buildCoverLetterPrompt({
        candidateName: input.candidateName,
        tone: input.tone,
        analysis: input.analysis,
        jobText: input.jobText,
      }),
      schema: coverLetterSchema,
    });

    return {
      letter,
      fallback: false,
      model: geminiConfig.model,
    };
  } catch (error) {
    console.error(
      "Gemini cover letter failed; using local template:",
      error instanceof Error ? error.message : error,
    );

    return {
      letter: mockCoverLetter(input),
      fallback: true,
      model: "resume-analyzer-local",
    };
  }
}

export interface ComparisonGeneration {
  verdict: string;
  fallback: boolean;
  model: string;
}

export async function generateComparisonVerdict(input: {
  jobTitle: string;
  company: string;
  entries: Array<{
    title: string;
    overallScore: number;
    scores: Record<string, number>;
    matchedCount: number;
    missingCount: number;
    matched: string[];
    missing: string[];
  }>;
}): Promise<ComparisonGeneration> {
  if (!isAiConfigured()) {
    return {
      verdict: mockComparisonVerdict(input.entries),
      fallback: false,
      model: "resume-analyzer-local",
    };
  }

  try {
    const result = await generateStructured({
      system: COMPARISON_SYSTEM,
      prompt: buildComparisonPrompt(input),
      schema: comparisonVerdictSchema,
    });

    return {
      verdict: result.verdict,
      fallback: false,
      model: geminiConfig.model,
    };
  } catch (error) {
    console.error(
      "Gemini comparison failed; using local verdict:",
      error instanceof Error ? error.message : error,
    );

    return {
      verdict: mockComparisonVerdict(input.entries),
      fallback: true,
      model: "resume-analyzer-local",
    };
  }
}

export { isAiConfigured, aiModeLabel, isMockAi } from "@/lib/ai/config";
