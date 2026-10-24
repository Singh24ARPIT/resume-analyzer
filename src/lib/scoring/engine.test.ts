import { describe, expect, it } from "vitest";
import {
  buildResumeMetrics,
  parseSections,
} from "@/lib/parsing/sections";
import { scoreResume } from "@/lib/scoring/engine";
import type { ParsedJob } from "@/lib/types";
import { JOB_TEXT, RESUME_TEXT } from "@/lib/testing/fixtures";

const job: ParsedJob = {
  title: "Senior Frontend Engineer",
  company: "Lumen Labs",
  seniority: "mid",
  yearsRequired: 3,
  mustHaveSkills: ["React", "TypeScript", "GraphQL"],
  niceToHaveSkills: ["Playwright", "AWS"],
  responsibilities: [
    "Own the frontend architecture for an analytics product.",
    "Partner with design and product on measurable improvements.",
  ],
  keywords: [],
  rawText: JOB_TEXT,
  sourceUrl: null,
};

function buildInput() {
  const sections = parseSections(RESUME_TEXT).sections;
  const metrics = buildResumeMetrics(RESUME_TEXT, sections);

  return {
    resumeText: RESUME_TEXT,
    sections,
    metrics,
    job,
    semanticScore: 80,
    fileType: "pdf",
  };
}

describe("deterministic scoring engine", () => {
  it("matches must-haves and preferred skills with evidence", () => {
    const result = scoreResume(buildInput());

    expect(result.matchedMust).toEqual(
      expect.arrayContaining(["React", "TypeScript"]),
    );
    expect(result.missingMust).toEqual(["GraphQL"]);
    expect(result.matchedNice).toContain("Playwright");
    expect(result.missingNice).toContain("AWS");
    expect(result.skills.matched.length).toBe(2);
    expect(result.skills.missing[0]?.name).toBe("GraphQL");
    expect(result.mustCoverage).toBe(67);
    expect(result.niceCoverage).toBe(50);
  });

  it("keeps every component inside 0–100 and uses the declared weights", () => {
    const result = scoreResume(buildInput());

    for (const value of Object.values(result.scores)) {
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(100);
    }

    expect(result.scores.semantic).toBe(80);

    const expectedOverall = Math.round(
      result.scores.skills * 0.35 +
        result.scores.experience * 0.2 +
        result.scores.semantic * 0.15 +
        result.scores.preferred * 0.1 +
        result.scores.ats * 0.1 +
        result.scores.impact * 0.1,
    );

    expect(result.overallScore).toBe(expectedOverall);
  });

  it("is deterministic for the same inputs", () => {
    const first = scoreResume(buildInput());
    const second = scoreResume(buildInput());

    expect(second).toEqual(first);
  });

  it("raises the skill score when requirements are covered", () => {
    const baseline = scoreResume(buildInput());
    const covered = scoreResume({
      ...buildInput(),
      job: {
        ...job,
        mustHaveSkills: ["React", "TypeScript"],
      },
    });

    expect(covered.scores.skills).toBe(100);
    expect(covered.scores.skills).toBeGreaterThan(baseline.scores.skills);
    expect(covered.overallScore).toBeGreaterThan(baseline.overallScore);
  });

  it("clamps an out-of-range semantic override", () => {
    const result = scoreResume({ ...buildInput(), semanticScore: 140 });
    expect(result.scores.semantic).toBe(100);
  });

  it("emits the full ATS check set and recognizes PDF input", () => {
    const result = scoreResume(buildInput());

    expect(result.ats).toHaveLength(8);
    expect(result.ats.map((check) => check.id)).toEqual(
      expect.arrayContaining([
        "text-layer",
        "sections",
        "contact",
        "length",
        "metrics",
        "verbs",
        "stuffing",
        "format",
      ]),
    );
    expect(result.ats.find((check) => check.id === "format")?.status).toBe(
      "pass",
    );
    expect(result.ats.find((check) => check.id === "sections")?.status).toBe(
      "pass",
    );
  });

  it("recognizes PDF and DOCX MIME types from the resume library", () => {
    const pdf = scoreResume({
      ...buildInput(),
      fileType: "application/pdf",
    });
    const docx = scoreResume({
      ...buildInput(),
      fileType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    expect(pdf.ats.find((check) => check.id === "format")?.status).toBe("pass");
    expect(docx.ats.find((check) => check.id === "format")?.status).toBe("pass");
  });

  it("marks missing sections as an ATS warning", () => {
    const result = scoreResume({
      resumeText: "A short plain text resume with no headers.",
      sections: { resume: "A short plain text resume with no headers." },
      metrics: {
        wordCount: 8,
        bulletCount: 0,
        quantifiedBullets: 0,
        actionVerbBullets: 0,
        yearsExperience: 0,
        sections: ["resume"],
        emailPresent: false,
        phonePresent: false,
      },
      job,
      semanticScore: 50,
      fileType: null,
    });

    expect(result.ats.find((check) => check.id === "sections")?.status).toBe(
      "warn",
    );
    expect(result.ats.find((check) => check.id === "format")?.status).toBe(
      "warn",
    );
  });
});
