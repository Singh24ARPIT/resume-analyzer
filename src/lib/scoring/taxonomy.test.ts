import { describe, expect, it } from "vitest";
import {
  canonicalSkillName,
  canonicalizeSkill,
  detectSkillNames,
  findSkillInText,
} from "@/lib/scoring/taxonomy";

describe("skill taxonomy", () => {
  it("normalizes aliases to the canonical name", () => {
    expect(canonicalizeSkill("react.js")?.name).toBe("React");
    expect(canonicalizeSkill("ReactJS")?.name).toBe("React");
    expect(canonicalSkillName("nextjs")).toBe("Next.js");
    expect(canonicalSkillName("Postgres")).toBe("PostgreSQL");
    expect(canonicalSkillName("something-unknown")).toBe("something-unknown");
  });

  it("detects skills with normalized aliases in prose", () => {
    const skills = detectSkillNames(
      "Built a dashboard with React.js, TypeScript, NextJS and PostgreSQL.",
    );

    expect(skills).toContain("React");
    expect(skills).toContain("TypeScript");
    expect(skills).toContain("Next.js");
    expect(skills).toContain("PostgreSQL");
    expect(skills).not.toContain("JavaScript");
  });

  it("ignores generic words and product suffixes", () => {
    const skills = detectSkillNames(
      [
        "Built an analytics dashboard with Next.js and React.js.",
        "Rest of the team maintained the CV format.",
        "Hired during the spring season.",
      ].join(" "),
    );

    expect(skills).not.toContain("JavaScript");
    expect(skills).not.toContain("Google Analytics");
    expect(skills).not.toContain("REST APIs");
    expect(skills).not.toContain("Computer Vision");
    expect(skills).not.toContain("Spring Boot");
    expect(skills).toContain("React");
    expect(skills).toContain("Next.js");
    expect(detectSkillNames("Led a design-system rollout")).toContain(
      "Design systems",
    );
  });

  it("requires the capital form of ambiguous single-letter skills", () => {
    expect(detectSkillNames("a standalone r value")).not.toContain("R");
    expect(detectSkillNames("RESUME SUMMARY EXPERIENCE")).not.toContain("R");
    expect(detectSkillNames("R and Python for analysis")).toContain("R");
    expect(detectSkillNames("GOLANG and Go services")).toContain("Go");
  });

  it("does not match case-sensitive language aliases in ordinary words", () => {
    expect(detectSkillNames("go to the store and buy milk")).not.toContain("Go");
    expect(detectSkillNames("Built a service with Go and Kubernetes")).toContain(
      "Go",
    );
  });

  it("respects token boundaries for short aliases", () => {
    expect(findSkillInText("PostgreSQL and MySQL", "SQL")).toBeNull();

    const hit = findSkillInText("SQL and PostgreSQL", "SQL");
    expect(hit?.skill.name).toBe("SQL");
    expect(hit?.count).toBe(1);

    const react = findSkillInText("React powers this interface", "React");
    expect(react?.count).toBe(1);
    expect(react?.evidence).toContain("React");
  });

  it("returns null for requirements that are absent", () => {
    expect(findSkillInText("A plain resume with no tools", "Kubernetes")).toBeNull();
  });
});
