import { describe, expect, it, vi } from "vitest";
import { computeSemanticScore, runAnalysis } from "@/lib/analysis/run";
import { JOB_TEXT, RESUME_TEXT } from "@/lib/testing/fixtures";

describe("analysis pipeline", () => {
  it("runs end-to-end with local feedback and no network calls", async () => {
    vi.stubEnv("MOCK_AI", "1");

    const output = await runAnalysis({
      id: "test-analysis",
      createdAt: "2026-01-01T00:00:00.000Z",
      resume: {
        id: "resume-1",
        title: "Arpit Singh — Frontend",
        fileName: "arpit-frontend.pdf",
        text: RESUME_TEXT,
        fileType: "pdf",
      },
      job: {
        id: "job-1",
        text: JOB_TEXT,
        title: "Senior Frontend Engineer",
        company: "Lumen Labs",
      },
      semanticScore: 74,
    });

    const { result, parsedJob, metrics, deterministic } = output;

    expect(result.id).toBe("test-analysis");
    expect(result.createdAt).toBe("2026-01-01T00:00:00.000Z");
    expect(result.model).toBe("rolefit-local");
    expect(result.aiFallback).toBe(false);
    expect(result.scores.semantic).toBe(74);
    expect(result.overallScore).toBe(deterministic.overallScore);
    expect(result.job.title).toBe(parsedJob.title);
    expect(result.job.company).toBe("Lumen Labs");
    expect(result.summary).toContain("Lumen Labs");
    expect(result.skills.missing.map((skill) => skill.name)).toContain(
      "GraphQL",
    );
    expect(result.skills.matched.map((skill) => skill.name)).toEqual(
      expect.arrayContaining(["React", "TypeScript"]),
    );
    expect(result.ats.length).toBe(8);
    expect(result.bulletRewrites.length).toBeGreaterThanOrEqual(0);
    expect(metrics.wordCount).toBeGreaterThan(100);
    expect(output.sections.experience).toContain("Lumen Labs");
    expect(parsedJob.mustHaveSkills.length).toBeGreaterThan(0);
  });

  it("uses lexical similarity when the AI is not configured", async () => {
    vi.stubEnv("MOCK_AI", "1");

    const score = await computeSemanticScore(RESUME_TEXT, JOB_TEXT);

    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(20);
    expect(score).toBeLessThanOrEqual(96);
  });

  it("honors a supplied semantic score and clamps it", async () => {
    vi.stubEnv("MOCK_AI", "1");

    const output = await runAnalysis({
      resume: {
        title: "Resume",
        fileName: "resume.docx",
        text: RESUME_TEXT,
        fileType: "docx",
      },
      job: {
        text: JOB_TEXT,
        title: "Frontend Engineer",
        company: "Lumen Labs",
      },
      semanticScore: 250,
      includeFeedback: false,
    });

    expect(output.result.scores.semantic).toBe(100);
    expect(output.result.aiFallback).toBe(false);
  });
});
