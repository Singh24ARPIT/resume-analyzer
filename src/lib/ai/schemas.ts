import { z } from "zod";

export const jdExtractionSchema = z.object({
  title: z.string().min(1).max(180),
  company: z.string().max(140).nullable().optional(),
  seniority: z
    .enum(["intern", "junior", "mid", "senior", "staff", "principal", "unknown"])
    .default("unknown"),
  yearsRequired: z.number().min(0).max(30).nullable().optional(),
  mustHaveSkills: z.array(z.string().min(1).max(80)).max(20).default([]),
  niceToHaveSkills: z.array(z.string().min(1).max(80)).max(20).default([]),
  responsibilities: z.array(z.string().min(10).max(400)).max(12).default([]),
});

export type JdExtraction = z.infer<typeof jdExtractionSchema>;

export const feedbackSchema = z.object({
  summary: z.string().min(20).max(900),
  strengths: z.array(z.string().min(10).max(500)).min(2).max(5),
  gaps: z
    .array(
      z.object({
        title: z.string().min(5).max(160),
        severity: z.enum(["high", "medium", "low"]),
        why: z.string().min(10).max(500),
        fix: z.string().min(10).max(600),
      }),
    )
    .min(1)
    .max(6),
  sectionFeedback: z
    .array(
      z.object({
        section: z.string().min(2).max(60),
        score: z.number().min(0).max(100),
        feedback: z.string().min(10).max(700),
      }),
    )
    .min(1)
    .max(7),
  bulletRewrites: z
    .array(
      z.object({
        original: z.string().min(10).max(500),
        improved: z.string().min(10).max(600),
        rationale: z.string().min(10).max(500),
        keywordsAdded: z.array(z.string().max(60)).max(6).optional().default([]),
      }),
    )
    .max(5)
    .default([]),
  suggestedSummary: z.string().min(20).max(1400),
  interviewQuestions: z
    .array(z.string().min(8).max(400))
    .max(6)
    .default([]),
});

export type FeedbackOutput = z.infer<typeof feedbackSchema>;

export const coverLetterSchema = z.object({
  subject: z.string().max(220).optional().default(""),
  body: z.string().min(80).max(5000),
});

export type CoverLetterOutput = z.infer<typeof coverLetterSchema>;

export const comparisonVerdictSchema = z.object({
  verdict: z.string().min(20).max(1000),
});

export type ComparisonVerdict = z.infer<typeof comparisonVerdictSchema>;
