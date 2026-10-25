import type { AtsCheck, ParsedJob, ResumeMetrics } from "@/lib/types";
import type { DeterministicResult } from "@/lib/scoring/engine";

export const FEEDBACK_SYSTEM = `You are the Resume Analyzer assistant, a senior technical recruiter who writes direct, useful resume feedback.

Rules:
- The deterministic scores are computed by Resume Analyzer's engine. Never change or contradict the overall score.
- Never invent employers, dates, degrees, metrics, tools, or achievements. If a fact is not in the resume, do not state it.
- If you suggest a bullet rewrite, preserve every fact from the original. You may sharpen verbs, structure, and emphasis, but you must not add numbers or claims.
- Feedback must reference this specific job description and this specific resume, not generic advice.
- Keep language plain and concrete. No hype, no em dashes, no "in today's fast-paced world".
- Return only a single JSON object. No markdown fences, no commentary.`;

export interface FeedbackPromptInput {
  job: ParsedJob;
  metrics: ResumeMetrics;
  scores: DeterministicResult;
  resumeTitle: string;
  resumeText: string;
  ats: AtsCheck[];
}

function list(values: string[], fallback = "none detected") {
  if (!values.length) return fallback;
  return values.map((value) => `- ${value}`).join("\n");
}

export function buildFeedbackPrompt(input: FeedbackPromptInput): string {
  const sectionScores = Object.entries(input.scores.sectionScores)
    .map(([section, score]) => `- ${section}: ${score}/100`)
    .join("\n");

  const atsLines = input.ats
    .filter((check) => check.status !== "pass")
    .map((check) => `- ${check.label} (${check.status}): ${check.detail}`)
    .join("\n");

  return `TASK
Write structured resume feedback for the role below. The scores are fixed; use them as context for tone and prioritization.

JOB
Title: ${input.job.title}
Company: ${input.job.company}
Seniority: ${input.job.seniority}
Years required: ${input.job.yearsRequired ?? "not stated"}
Must-have skills:
${list(input.job.mustHaveSkills)}
Nice-to-have skills:
${list(input.job.niceToHaveSkills)}
Responsibilities:
${list(input.job.responsibilities)}
Job description (truncated):
"""
${input.job.rawText.slice(0, 7000)}
"""

RESUME
Title: ${input.resumeTitle}
Word count: ${input.metrics.wordCount}
Estimated years of experience: ${input.metrics.yearsExperience}
Bullets: ${input.metrics.bulletCount} total, ${input.metrics.quantifiedBullets} quantified, ${input.metrics.actionVerbBullets} starting with an action verb.

DETERMINISTIC RESULT
Overall score: ${input.scores.overallScore}/100
Skills: ${input.scores.scores.skills} (must-have coverage ${input.scores.mustCoverage}%)
Experience: ${input.scores.scores.experience}
Semantic fit: ${input.scores.scores.semantic}
Preferred skills: ${input.scores.scores.preferred} (coverage ${input.scores.niceCoverage}%)
ATS: ${input.scores.scores.ats}
Impact and clarity: ${input.scores.scores.impact}

Matched must-haves:
${list(input.scores.matchedMust)}
Missing must-haves:
${list(input.scores.missingMust)}
Matched nice-to-haves:
${list(input.scores.matchedNice)}
Missing nice-to-haves:
${list(input.scores.missingNice)}

Section scores:
${sectionScores || "- no sections detected"}

ATS issues:
${atsLines || "- none"}

Resume text (contact details already redacted):
"""
${input.resumeText.slice(0, 12000)}
"""

OUTPUT JSON SHAPE
{
  "summary": "2–4 sentences on fit and the single most important thing to fix",
  "strengths": ["2–5 specific strengths, each citing evidence from the resume"],
  "gaps": [
    {
      "title": "short gap title",
      "severity": "high | medium | low",
      "why": "why it matters for this job, referencing the requirement",
      "fix": "a specific, achievable action"
    }
  ],
  "sectionFeedback": [
    { "section": "Experience", "score": 0-100, "feedback": "specific feedback" }
  ],
  "bulletRewrites": [
    {
      "original": "exact bullet copied from the resume",
      "improved": "rewritten bullet using only facts from the original",
      "rationale": "what changed and why it helps for this role",
      "keywordsAdded": ["terms already implied by the original"]
    }
  ],
  "suggestedSummary": "a 2–3 sentence resume summary tailored to this role, using only real facts",
  "interviewQuestions": ["up to 6 questions this hiring team is likely to ask"]
}

Return 3–5 gaps, 3–7 section feedback rows for sections that exist, and at most 4 bullet rewrites.`;
}

export const COVER_LETTER_SYSTEM = `You are the Resume Analyzer assistant, writing a cover letter for a specific candidate and job.

Rules:
- Use only facts present in the supplied resume analysis and resume text. Never invent employers, projects, metrics, or skills.
- Write in first person, as the candidate. Do not mention AI, Resume Analyzer, or scoring.
- Keep it under 320 words. Specific, grounded, no clichés, no em dashes.
- Match the requested tone: professional (measured), enthusiastic (warm and energetic), or concise (short paragraphs).
- Return only JSON: {"subject": "...", "body": "..."} with the body using \\n\\n between paragraphs.`;

export function buildCoverLetterPrompt(input: {
  candidateName: string;
  tone: string;
  analysis: {
    job: { title: string; company: string };
    summary: string;
    strengths: string[];
    skills: { matched: Array<{ name: string }>; missing: Array<{ name: string }> };
    bulletRewrites: Array<{ improved: string }>;
    suggestedSummary: string;
    resume: { title: string };
  };
  jobText?: string;
}) {
  const { analysis } = input;

  return `CANDIDATE
Name: ${input.candidateName}
Resume: ${analysis.resume.title}

TARGET ROLE
Title: ${analysis.job.title}
Company: ${analysis.job.company}

MATCH SUMMARY
${analysis.summary}

STRENGTHS TO DRAW ON
${list(analysis.strengths)}

MATCHED SKILLS
${list(analysis.skills.matched.map((skill) => skill.name))}

SKILLS THE CANDIDATE DOES NOT HAVE (do not claim these)
${list(analysis.skills.missing.map((skill) => skill.name))}

TAILORED SUMMARY DRAFT
${analysis.suggestedSummary}

BEST AVAILABLE IMPACT EVIDENCE (already true in the resume)
${list(analysis.bulletRewrites.map((rewrite) => rewrite.improved))}

${input.jobText ? `JOB DESCRIPTION EXCERPT\n"""\n${input.jobText.slice(0, 4000)}\n"""` : ""}

TONE
${input.tone}

Write the cover letter now. Address it to the ${analysis.job.company} hiring team. Sign with the candidate's name.`;
}

export const COMPARISON_SYSTEM = `You are the Resume Analyzer assistant, comparing several resume versions for the same job.

Rules:
- Base every claim on the supplied scores and skill lists.
- Say which resume is strongest and why, in 2–4 sentences.
- Also say what the runner-up does better, if anything.
- Do not invent experience. Do not restate every number.
- Return only JSON: {"verdict": "..."}.`;

export function buildComparisonPrompt(input: {
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
}) {
  const rows = input.entries
    .map(
      (entry) => `${entry.title}
- overall: ${entry.overallScore}
- skills: ${entry.scores.skills}, experience: ${entry.scores.experience}, semantic: ${entry.scores.semantic}, preferred: ${entry.scores.preferred}, ats: ${entry.scores.ats}, impact: ${entry.scores.impact}
- matched must-haves (${entry.matchedCount}): ${entry.matched.join(", ") || "none"}
- missing must-haves (${entry.missingCount}): ${entry.missing.join(", ") || "none"}`,
    )
    .join("\n\n");

  return `JOB
${input.jobTitle} at ${input.company}

RESUME VERSIONS
${rows}

Write the comparison verdict.`;
}
