import { describe, expect, it } from "vitest";
import {
  mockComparisonVerdict,
  mockCoverLetter,
  mockFeedback,
  mockJdExtraction,
} from "@/lib/ai/mock";
import {
  buildResumeMetrics,
  parseSections,
} from "@/lib/parsing/sections";
import { inferJobFromText } from "@/lib/parsing/jd-heuristics";
import { scoreResume } from "@/lib/scoring/engine";
import { JOB_TEXT, RESUME_TEXT } from "@/lib/testing/fixtures";

function buildFeedback() {
  const job = inferJobFromText({
    text: JOB_TEXT,
    title: "Senior Frontend Engineer",
    company: "Lumen Labs",
  });
  const sections = parseSections(RESUME_TEXT).sections;
  const metrics = buildResumeMetrics(RESUME_TEXT, sections);
  const scores = scoreResume({
    resumeText: RESUME_TEXT,
    sections,
    metrics,
    job,
    semanticScore: 78,
    fileType: "pdf",
  });

  return { job, metrics, scores };
}

describe("local feedback generation", () => {
  it("builds grounded feedback from the score context", () => {
    const { job, metrics, scores } = buildFeedback();

    const feedback = mockFeedback({
      job,
      metrics,
      scores,
      resumeTitle: "Arpit Singh — Frontend",
      resumeText: RESUME_TEXT,
    });

    expect(feedback.summary).toContain("Lumen Labs");
    expect(feedback.summary).toContain(job.title);
    expect(feedback.summary).toContain("This resume (Arpit Singh — Frontend)");
    expect(feedback.strengths.length).toBeGreaterThanOrEqual(2);
    expect(feedback.gaps.length).toBeGreaterThanOrEqual(1);
    expect(feedback.sectionFeedback.length).toBeGreaterThanOrEqual(1);
    expect(feedback.suggestedSummary.length).toBeGreaterThan(40);
    expect(feedback.interviewQuestions.length).toBeLessThanOrEqual(5);
  });

  it("only rewrites bullets when it finds weak openers", () => {
    const { job, metrics, scores } = buildFeedback();

    const feedback = mockFeedback({
      job,
      metrics,
      scores,
      resumeTitle: "Resume",
      resumeText: [
        "SUMMARY",
        "Engineer.",
        "EXPERIENCE",
        "- Worked on a dashboard used by 1,000 customers.",
        "- Helped build a design system for 4 teams.",
        "- Built a CI pipeline that reduced deploy time by 30%.",
      ].join("\n"),
    });

    expect(feedback.bulletRewrites.length).toBeGreaterThan(0);
    for (const rewrite of feedback.bulletRewrites) {
      expect(rewrite.original).not.toBe(rewrite.improved);
      expect(rewrite.improved.length).toBeGreaterThan(10);
    }
  });

  it("creates a cover letter from the selected evidence", () => {
    const letter = mockCoverLetter({
      candidateName: "Arpit Singh",
      tone: "professional",
      jobTitle: "Senior Frontend Engineer",
      company: "Lumen Labs",
      matchedSkills: ["React", "TypeScript", "Next.js"],
      strengths: ["Ships measurable product improvements."],
      evidence: ["Cut time-to-first-chart by 42% for 18,000 users."],
      summary: "Strong fit.",
    });

    expect(letter.subject).toContain("Senior Frontend Engineer");
    expect(letter.subject).toContain("Arpit Singh");
    expect(letter.body.startsWith("Dear Hiring Manager,")).toBe(true);
    expect(letter.body).toContain("Lumen Labs");
    expect(letter.body).toContain("Arpit Singh");
    expect(letter.body).toContain("42%");
  });

  it("does not leak report-style strengths into the letter", () => {
    const letter = mockCoverLetter({
      candidateName: "Arpit Singh",
      tone: "concise",
      jobTitle: "Senior Frontend Engineer",
      company: "Lumen Labs",
      matchedSkills: ["React", "TypeScript", "Next.js"],
      strengths: ["Covers 3 of 5 must-have requirements, including React."],
      evidence: [],
      summary: "Report summary.",
    });

    expect(letter.body).not.toContain("Covers 3 of 5");
    expect(letter.body).toContain("My recent work has centered on");
    expect(letter.body).toContain("React");
  });

  it("picks the highest scoring resume in a comparison", () => {
    const verdict = mockComparisonVerdict([
      {
        title: "Resume v2",
        overallScore: 72,
        scores: { skills: 70, impact: 68 },
        matchedCount: 5,
        missingCount: 3,
      },
      {
        title: "Resume v3",
        overallScore: 86,
        scores: { skills: 92, impact: 80 },
        matchedCount: 8,
        missingCount: 1,
      },
    ]);

    expect(verdict).toContain("Resume v3");
    expect(verdict).toContain("86/100");
    expect(verdict).toContain("Resume v2");
  });

  it("uses a supplied title in the local JD extractor", () => {
    const extraction = mockJdExtraction(
      "Senior engineer needed.",
      "Staff Platform Engineer",
    );

    expect(extraction.title).toBe("Staff Platform Engineer");
    expect(extraction.mustHaveSkills).toEqual([]);
  });
});
