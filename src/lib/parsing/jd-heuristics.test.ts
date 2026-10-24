import { describe, expect, it } from "vitest";
import { inferJobFromText } from "@/lib/parsing/jd-heuristics";
import { JOB_TEXT } from "@/lib/testing/fixtures";

describe("job description inference", () => {
  it("extracts title, seniority, years, and requirement buckets", () => {
    const job = inferJobFromText({
      text: JOB_TEXT,
      title: "Senior Frontend Engineer",
      company: "Lumen Labs",
      sourceUrl: "https://example.com/jobs/123",
    });

    expect(job.title).toBe("Senior Frontend Engineer");
    expect(job.company).toBe("Lumen Labs");
    expect(job.seniority).toBe("senior");
    expect(job.yearsRequired).toBe(5);
    expect(job.sourceUrl).toBe("https://example.com/jobs/123");

    expect(job.mustHaveSkills).toEqual(
      expect.arrayContaining([
        "React",
        "TypeScript",
        "Next.js",
        "GraphQL",
        "Design systems",
      ]),
    );
    expect(job.niceToHaveSkills).toEqual(
      expect.arrayContaining(["Playwright", "A/B testing", "AWS"]),
    );
    expect(job.mustHaveSkills).not.toContain("Playwright");
    expect(job.responsibilities.length).toBeGreaterThan(0);
    expect(job.rawText).toContain("Senior Frontend Engineer");
  });

  it("infers a title from the first meaningful line", () => {
    const job = inferJobFromText({
      text: "Staff Platform Engineer\nWe build infrastructure with Kubernetes and Go.",
    });

    expect(job.title).toBe("Staff Platform Engineer");
    expect(job.seniority).toBe("staff");
    expect(job.company).toBe("Company not specified");
    expect(job.mustHaveSkills).toEqual(
      expect.arrayContaining(["Kubernetes", "Go"]),
    );
  });

  it("falls back to keyword extraction when no known skills appear", () => {
    const job = inferJobFromText({
      text: "We need expertise in zeta quarkon systems and orbital telemetry.",
    });

    expect(job.mustHaveSkills.length).toBeGreaterThan(0);
    expect(job.keywords.length).toBeGreaterThan(0);
  });

  it("does not treat preferred requirements as must-haves when classified", () => {
    const job = inferJobFromText({
      text: [
        "Product Engineer",
        "Requirements:",
        "- Required: TypeScript and React",
        "- Preferred: Rust",
        "Responsibilities:",
        "- Build product features and measure their impact with the team.",
      ].join("\n"),
    });

    expect(job.mustHaveSkills).toContain("TypeScript");
    expect(job.mustHaveSkills).toContain("React");
    expect(job.niceToHaveSkills).toContain("Rust");
    expect(job.mustHaveSkills).not.toContain("Rust");
  });
});
