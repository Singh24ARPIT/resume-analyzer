import type {
  AtsCheck,
  KeywordRow,
  ParsedJob,
  ResumeMetrics,
  SkillAnalysis,
  SkillMatch,
  SubScores,
} from "@/lib/types";
import {
  canonicalizeSkill,
  canonicalSkillName,
  detectSkills,
  findSkillInText,
} from "@/lib/scoring/taxonomy";
import { lexicalSimilarity } from "@/lib/scoring/semantic";
import { measureBullets } from "@/lib/parsing/sections";

export interface DeterministicInput {
  resumeText: string;
  sections: Record<string, string>;
  metrics: ResumeMetrics;
  job: ParsedJob;
  semanticScore?: number | null;
  fileType?: string | null;
}

export interface DeterministicResult {
  scores: SubScores;
  overallScore: number;
  skills: SkillAnalysis;
  keywords: KeywordRow[];
  ats: AtsCheck[];
  sectionScores: Record<string, number>;
  matchedMust: string[];
  missingMust: string[];
  matchedNice: string[];
  missingNice: string[];
  mustCoverage: number;
  niceCoverage: number;
}

function clamp(value: number, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function matchRequirements(
  requirements: string[],
  resumeText: string,
  resumeSkills: Set<string>,
) {
  const matched: SkillMatch[] = [];
  const missing: SkillMatch[] = [];
  const seen = new Set<string>();

  for (const raw of requirements) {
    const name = canonicalSkillName(raw);
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);

    const hit = findSkillInText(resumeText, name);
    const inSkillList = resumeSkills.has(key);

    if (hit || inSkillList) {
      matched.push({
        name,
        category: hit?.skill.category,
        evidence: hit?.evidence || undefined,
      });
    } else {
      missing.push({ name, category: canonicalizeSkill(name)?.category });
    }
  }

  return { matched, missing };
}

const SENIORITY_RANK: Record<ParsedJob["seniority"], number> = {
  intern: 1,
  junior: 2,
  mid: 3,
  senior: 4,
  staff: 5,
  principal: 6,
  unknown: 3,
};

function resumeSeniorityRank(metrics: ResumeMetrics, text: string) {
  let rank = metrics.yearsExperience >= 9 ? 6 : metrics.yearsExperience >= 6 ? 5 : metrics.yearsExperience >= 4 ? 4 : metrics.yearsExperience >= 2 ? 3 : 2;

  if (/\bprincipal\b/i.test(text)) rank = Math.max(rank, 6);
  if (/\b(staff|technical lead|team lead|engineering manager)\b/i.test(text)) {
    rank = Math.max(rank, 5);
  }
  if (/\bsenior\b/i.test(text)) rank = Math.max(rank, 4);

  return rank;
}

function experienceScore(metrics: ResumeMetrics, job: ParsedJob, text: string) {
  const required = job.yearsRequired;
  const years = metrics.yearsExperience;

  let base: number;

  if (required === null) {
    base = years > 0 ? 80 : 68;
  } else if (years <= 0) {
    base = 55;
  } else {
    const difference = years - required;
    if (difference >= 2) base = 98;
    else if (difference >= 0) base = 88;
    else if (difference >= -1) base = 72;
    else if (difference >= -2) base = 56;
    else base = 38;
  }

  if (job.seniority !== "unknown") {
    const difference =
      resumeSeniorityRank(metrics, text) - SENIORITY_RANK[job.seniority];
    if (difference >= 1) base += 7;
    else if (difference === 0) base += 3;
    else if (difference === -1) base -= 9;
    else base -= 18;
  }

  return Math.round(clamp(base, 25, 100));
}

function impactScore(metrics: ResumeMetrics) {
  if (metrics.bulletCount < 3) return 52;

  const metricsRatio = metrics.quantifiedBullets / metrics.bulletCount;
  const actionRatio = metrics.actionVerbBullets / metrics.bulletCount;
  const quality =
    metrics.bulletCount >= 6 && metrics.bulletCount <= 24
      ? 100
      : metrics.bulletCount >= 3 && metrics.bulletCount <= 5
        ? 75
        : 80;

  return Math.round(
    clamp(45 * metricsRatio + 35 * actionRatio + 20 * (quality / 100), 25, 100),
  );
}

function atsChecks(
  metrics: ResumeMetrics,
  keywordRows: KeywordRow[],
  fileType?: string | null,
): AtsCheck[] {
  const sectionCount = metrics.sections.length;
  const maxKeywordCount = Math.max(
    0,
    ...keywordRows.map((keyword) => keyword.count),
  );
  const metricsRatio = metrics.bulletCount
    ? metrics.quantifiedBullets / metrics.bulletCount
    : 0;
  const actionRatio = metrics.bulletCount
    ? metrics.actionVerbBullets / metrics.bulletCount
    : 0;
  const normalizedFileType = (fileType ?? "").toLowerCase();
  const isPdf = normalizedFileType === "pdf" || normalizedFileType.includes("pdf");
  const isDocx =
    normalizedFileType === "docx" ||
    normalizedFileType.includes("wordprocessingml") ||
    normalizedFileType.includes("msword") ||
    normalizedFileType.endsWith(".docx");

  return [
    {
      id: "text-layer",
      label: "Text layer detected",
      status: metrics.wordCount >= 150 ? "pass" : metrics.wordCount >= 80 ? "warn" : "fail",
      detail: `${metrics.wordCount} words extracted as selectable text.`,
    },
    {
      id: "sections",
      label: "Standard section headers",
      status: sectionCount >= 3 ? "pass" : sectionCount >= 1 ? "warn" : "fail",
      detail: sectionCount
        ? `Detected: ${metrics.sections
            .map((section) => section.charAt(0).toUpperCase() + section.slice(1))
            .join(", ")}.`
        : "No standard headers were detected. Use Summary, Experience, Projects, Education, and Skills.",
    },
    {
      id: "contact",
      label: "Contact details present",
      status: metrics.emailPresent && metrics.phonePresent
        ? "pass"
        : metrics.emailPresent || metrics.phonePresent
          ? "warn"
          : "fail",
      detail:
        metrics.emailPresent && metrics.phonePresent
          ? "Email and phone found. Contact details are redacted before AI calls."
          : metrics.emailPresent
            ? "Email found, but no phone number. Add one if the role expects calls."
            : metrics.phonePresent
              ? "Phone found, but no email. Add a professional email."
              : "No email or phone found in the resume text.",
    },
    {
      id: "length",
      label: "Resume length",
      status:
        metrics.wordCount >= 250 && metrics.wordCount <= 1000
          ? "pass"
          : metrics.wordCount >= 150 && metrics.wordCount <= 1300
            ? "warn"
            : "fail",
      detail: `${metrics.wordCount} words. A focused 1–2 page resume works best.`,
    },
    {
      id: "metrics",
      label: "Quantified achievements",
      status:
        metrics.bulletCount === 0
          ? "warn"
          : metricsRatio >= 0.4
            ? "pass"
            : metricsRatio >= 0.2
              ? "warn"
              : "fail",
      detail: `${metrics.quantifiedBullets} of ${metrics.bulletCount} bullets include a number, percentage, or currency value.`,
    },
    {
      id: "verbs",
      label: "Strong action verbs",
      status:
        metrics.bulletCount === 0
          ? "warn"
          : actionRatio >= 0.5
            ? "pass"
            : actionRatio >= 0.25
              ? "warn"
              : "fail",
      detail: `${metrics.actionVerbBullets} of ${metrics.bulletCount} bullets start with a strong action verb.`,
    },
    {
      id: "stuffing",
      label: "No keyword stuffing",
      status:
        maxKeywordCount <= 12 ? "pass" : maxKeywordCount <= 18 ? "warn" : "fail",
      detail: maxKeywordCount
        ? `The most repeated requirement appears ${maxKeywordCount} times.`
        : "No requirement keywords were detected in the resume.",
    },
    {
      id: "format",
      label: "ATS-friendly format",
      status: isPdf || isDocx ? "pass" : "warn",
      detail: isPdf
        ? "Text-based PDF — broadly compatible with applicant tracking systems."
        : isDocx
          ? "DOCX — readable by most applicant tracking systems."
          : "Format could not be verified. PDF or DOCX is safest.",
    },
  ];
}

function atsScore(checks: AtsCheck[]) {
  const value = (status: AtsCheck["status"]) =>
    status === "pass" ? 1 : status === "warn" ? 0.55 : 0.15;
  return Math.round(
    (checks.reduce((sum, check) => sum + value(check.status), 0) /
      checks.length) *
      100,
  );
}

function sectionScores(
  sections: Record<string, string>,
  metrics: ResumeMetrics,
  mustCoverage: number,
  bonusCount: number,
) {
  const scores: Record<string, number> = {};
  const metricsRatio = metrics.bulletCount
    ? metrics.quantifiedBullets / metrics.bulletCount
    : 0;
  const actionRatio = metrics.bulletCount
    ? metrics.actionVerbBullets / metrics.bulletCount
    : 0;

  for (const [section, text] of Object.entries(sections)) {
    const bullets = measureBullets(text);
    const bulletQuality = bullets.bulletCount
      ? bullets.quantifiedBullets / Math.max(1, bullets.bulletCount)
      : 0;

    if (section === "experience") {
      scores[section] = Math.round(
        clamp(58 + metricsRatio * 18 + actionRatio * 14 + bulletQuality * 8),
      );
    } else if (section === "projects") {
      scores[section] = Math.round(
        clamp(60 + metricsRatio * 16 + actionRatio * 12 + bulletQuality * 8),
      );
    } else if (section === "skills") {
      scores[section] = Math.round(
        clamp(55 + mustCoverage * 0.35 + (bonusCount > 0 ? 5 : 0)),
      );
    } else if (section === "summary") {
      const lengthBonus = text.length >= 120 && text.length <= 700 ? 8 : 0;
      const mentionsSkill = mustCoverage > 0 ? 8 : 0;
      scores[section] = Math.round(clamp(62 + lengthBonus + mentionsSkill));
    } else if (section === "education") {
      scores[section] = 82;
    } else if (section === "certifications") {
      scores[section] = 80;
    } else {
      scores[section] = Math.round(clamp(66 + bulletQuality * 12));
    }
  }

  return scores;
}

export function scoreResume(input: DeterministicInput): DeterministicResult {
  const resumeSkillsList = detectSkills(input.resumeText);
  const resumeSkills = new Set(
    resumeSkillsList.map((hit) => hit.skill.name.toLowerCase()),
  );

  const must = matchRequirements(
    input.job.mustHaveSkills,
    input.resumeText,
    resumeSkills,
  );
  const nice = matchRequirements(
    input.job.niceToHaveSkills,
    input.resumeText,
    resumeSkills,
  );

  const mustCoverage = input.job.mustHaveSkills.length
    ? must.matched.length / input.job.mustHaveSkills.length
    : 0;
  const niceCoverage = input.job.niceToHaveSkills.length
    ? nice.matched.length / input.job.niceToHaveSkills.length
    : 0;

  const skillsScore = input.job.mustHaveSkills.length
    ? Math.round(mustCoverage * 100)
    : input.job.niceToHaveSkills.length
      ? Math.round(niceCoverage * 100)
      : 70;

  const preferredScore = input.job.niceToHaveSkills.length
    ? Math.round(niceCoverage * 100)
    : Math.max(65, skillsScore);

  const requirementNames = new Set(
    [...input.job.mustHaveSkills, ...input.job.niceToHaveSkills].map((skill) =>
      canonicalSkillName(skill).toLowerCase(),
    ),
  );

  const bonus: SkillMatch[] = resumeSkillsList
    .filter((hit) => !requirementNames.has(hit.skill.name.toLowerCase()))
    .slice(0, 8)
    .map((hit) => ({
      name: hit.skill.name,
      category: hit.skill.category,
      evidence: hit.evidence || undefined,
    }));

  const skills: SkillAnalysis = {
    matched: must.matched,
    missing: must.missing,
    bonus,
  };

  const keywords: KeywordRow[] = [
    ...input.job.mustHaveSkills.map((skill) => ({
      skill,
      importance: "must" as const,
    })),
    ...input.job.niceToHaveSkills.map((skill) => ({
      skill,
      importance: "nice" as const,
    })),
  ]
    .map(({ skill, importance }) => {
      const name = canonicalSkillName(skill);
      const hit = findSkillInText(input.resumeText, name);
      return {
        term: name,
        importance,
        inResume: Boolean(hit),
        count: hit?.count ?? 0,
      };
    })
    .filter(
      (row, index, rows) =>
        rows.findIndex(
          (candidate) => candidate.term.toLowerCase() === row.term.toLowerCase(),
        ) === index,
    );

  const checks = atsChecks(input.metrics, keywords, input.fileType);
  const ats = atsScore(checks);
  const experience = experienceScore(input.metrics, input.job, input.resumeText);
  const impact = impactScore(input.metrics);
  const semantic =
    typeof input.semanticScore === "number"
      ? Math.round(clamp(input.semanticScore))
      : lexicalSimilarity(input.resumeText, input.job.rawText);

  const scores: SubScores = {
    skills: Math.round(clamp(skillsScore)),
    experience,
    semantic,
    preferred: Math.round(clamp(preferredScore)),
    ats,
    impact,
  };

  const overallScore = Math.round(
    scores.skills * 0.35 +
      scores.experience * 0.2 +
      scores.semantic * 0.15 +
      scores.preferred * 0.1 +
      scores.ats * 0.1 +
      scores.impact * 0.1,
  );

  return {
    scores,
    overallScore: Math.round(clamp(overallScore)),
    skills,
    keywords,
    ats: checks,
    sectionScores: sectionScores(
      input.sections,
      input.metrics,
      mustCoverage * 100,
      bonus.length,
    ),
    matchedMust: must.matched.map((skill) => skill.name),
    missingMust: must.missing.map((skill) => skill.name),
    matchedNice: nice.matched.map((skill) => skill.name),
    missingNice: nice.missing.map((skill) => skill.name),
    mustCoverage: Math.round(mustCoverage * 100),
    niceCoverage: Math.round(niceCoverage * 100),
  };
}
