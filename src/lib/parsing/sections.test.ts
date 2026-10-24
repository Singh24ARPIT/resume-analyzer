import { describe, expect, it } from "vitest";
import {
  buildResumeMetrics,
  estimateYearsExperience,
  measureBullets,
  parseSections,
  redactPII,
} from "@/lib/parsing/sections";
import { RESUME_TEXT } from "@/lib/testing/fixtures";

describe("section parsing", () => {
  it("detects standard headers and inline skill lists", () => {
    const result = parseSections(
      [
        "SUMMARY",
        "Frontend engineer focused on accessible products.",
        "WORK EXPERIENCE",
        "Senior Engineer, Lumen Labs",
        "- Built the analytics dashboard in React.",
        "TECHNICAL SKILLS: React, TypeScript, PostgreSQL",
        "EDUCATION",
        "B.Tech in Computer Science",
      ].join("\n"),
    );

    expect(result.detected).toEqual([
      "summary",
      "experience",
      "skills",
      "education",
    ]);
    expect(result.sections.summary).toContain("Frontend engineer");
    expect(result.sections.experience).toContain("Built the analytics");
    expect(result.sections.skills).toContain("TypeScript");
    expect(result.sections.education).toContain("B.Tech");
  });

  it("falls back to a single resume section when no headers are present", () => {
    const result = parseSections("Just a paragraph of resume text.");
    expect(result.detected).toEqual([]);
    expect(result.sections.resume).toContain("Just a paragraph");
  });
});

describe("experience estimation", () => {
  it("reads month-level date ranges", () => {
    expect(estimateYearsExperience("Jan 2020 - Dec 2022")).toBe(3);
  });

  it("reads an explicitly stated number of years", () => {
    expect(estimateYearsExperience("Engineer with 7+ years of experience.")).toBe(
      7,
    );
  });

  it("returns zero when there is no evidence", () => {
    expect(estimateYearsExperience("No dates in this text at all.")).toBe(0);
  });
});

describe("bullet measurement", () => {
  it("counts quantified and action-verb bullets", () => {
    const result = measureBullets(
      [
        "- Built a dashboard that cut load time by 42% for 18,000 users.",
        "- Led the design-system rollout across 6 teams.",
        "- Worked on miscellaneous internal tasks.",
      ].join("\n"),
    );

    expect(result.bulletCount).toBe(3);
    expect(result.quantifiedBullets).toBe(2);
    expect(result.actionVerbBullets).toBe(2);
  });

  it("falls back to sentence-like lines when bullets are missing", () => {
    const result = measureBullets(
      [
        "Built a dashboard that cut load time by 42% for 18,000 monthly users.",
        "Led a design-system rollout across six product teams and 24 components.",
        "Introduced Playwright tests that reduced release hotfixes by 35%.",
        "Mentored two engineers through their first production launch.",
      ].join("\n"),
    );

    expect(result.bulletCount).toBeGreaterThanOrEqual(3);
    expect(result.quantifiedBullets).toBeGreaterThanOrEqual(3);
  });
});

describe("PII redaction", () => {
  it("removes email, phone, and links", () => {
    const redacted = redactPII(
      "Arpit, arpit@example.com, +1 555-123-4567, https://example.com/work",
    );

    expect(redacted).not.toContain("arpit@example.com");
    expect(redacted).not.toContain("example.com");
    expect(redacted).not.toContain("555-123-4567");
    expect(redacted).toContain("[email]");
    expect(redacted).toContain("[link]");
  });
});

describe("resume metrics", () => {
  it("combines sections, bullets, and contact signals", () => {
    const sections = parseSections(RESUME_TEXT).sections;
    const metrics = buildResumeMetrics(RESUME_TEXT, sections);

    expect(metrics.wordCount).toBeGreaterThan(100);
    expect(metrics.sections).toEqual(
      expect.arrayContaining(["summary", "experience", "skills", "education"]),
    );
    expect(metrics.bulletCount).toBeGreaterThanOrEqual(5);
    expect(metrics.emailPresent).toBe(true);
    expect(metrics.phonePresent).toBe(true);
    expect(metrics.yearsExperience).toBeGreaterThanOrEqual(5);
  });
});
