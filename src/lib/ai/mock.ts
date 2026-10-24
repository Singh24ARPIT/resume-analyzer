import type { DeterministicResult } from "@/lib/scoring/engine";
import type { ParsedJob, ResumeMetrics } from "@/lib/types";
import type {
  CoverLetterOutput,
  FeedbackOutput,
  JdExtraction,
} from "@/lib/ai/schemas";

interface MockFeedbackInput {
  job: ParsedJob;
  metrics: ResumeMetrics;
  scores: DeterministicResult;
  resumeTitle: string;
  resumeText: string;
}

function joinSkills(skills: string[], limit = 3) {
  const list = skills.slice(0, limit);
  if (list.length <= 1) return list.join("");
  if (list.length === 2) return `${list[0]} and ${list[1]}`;
  return `${list.slice(0, -1).join(", ")}, and ${list[list.length - 1]}`;
}

function sectionLabel(key: string) {
  if (key === "experience") return "Experience";
  if (key === "projects") return "Projects";
  if (key === "skills") return "Skills";
  if (key === "summary") return "Summary";
  if (key === "education") return "Education";
  if (key === "certifications") return "Certifications";
  return key.charAt(0).toUpperCase() + key.slice(1);
}

function sectionProse(section: string, score: number) {
  const name = sectionLabel(section);

  if (name === "Experience") {
    return score >= 80
      ? "The experience section carries real outcomes and reads at the right level. Keep the strongest scope and metric in the first line of each role."
      : "The experience section has the right shape but needs sharper evidence. Put the scope, the action, and the outcome in one line, and quantify at least half of the bullets.";
  }

  if (name === "Projects") {
    return score >= 80
      ? "Projects are specific and relevant. Trim feature lists and keep the problem, the constraint, and the result."
      : "Projects read more like feature lists than outcomes. For each one, name the problem, what you built, and what changed as a result.";
  }

  if (name === "Skills") {
    return score >= 80
      ? "The skills section is clear and well grouped. Move the requirements that are missing from the job description into the top group once you have real evidence for them."
      : "The skills section covers part of the requirement list. Group by category and add only tools you can defend in an interview.";
  }

  if (name === "Summary") {
    return score >= 80
      ? "The summary is a useful framing paragraph. Keep it focused on the target role rather than a general biography."
      : "The summary describes your history more than this role. Rewrite it around the two or three requirements that matter most for this job.";
  }

  if (name === "Education") {
    return "Education is present and easy to parse. Keep it brief unless the role is research-heavy.";
  }

  if (name === "Certifications") {
    return "Certifications are listed clearly. Keep only the ones that support this role.";
  }

  return `${name} is present. Tighten it so every line either proves a requirement or adds context a recruiter needs.`;
}

const WEAK_OPENERS: Array<[RegExp, string]> = [
  [/^worked on\s+/i, "Delivered "],
  [/^worked with\s+/i, "Partnered with "],
  [/^helped (?:to )?/i, "Contributed to "],
  [/^assisted (?:with|in)\s+/i, "Supported "],
  [/^responsible for\s+/i, "Owned "],
  [/^involved in\s+/i, "Contributed to "],
  [/^participated in\s+/i, "Contributed to "],
  [/^tasked with\s+/i, "Owned "],
];

function extractBullets(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => /^[•●▪◦‣·*\-–—]\s+/.test(line))
    .map((line) => line.replace(/^[•●▪◦‣·*\-–—]\s*/, "").trim())
    .filter(
      (line) =>
        line.length >= 24 &&
        line.length <= 260 &&
        !line.startsWith("[") &&
        !line.includes("@"),
    );
}

function mockRewrites(text: string) {
  const rewrites: FeedbackOutput["bulletRewrites"] = [];

  for (const bullet of extractBullets(text)) {
    if (rewrites.length >= 3) break;

    for (const [pattern, replacement] of WEAK_OPENERS) {
      if (!pattern.test(bullet)) continue;

      let improved = bullet.replace(pattern, replacement);
      improved = improved.charAt(0).toUpperCase() + improved.slice(1);

      if (improved !== bullet) {
        rewrites.push({
          original: bullet,
          improved,
          rationale:
            "Replaces a passive opening with a direct action verb. No facts were added; edit the result so it still sounds like you.",
          keywordsAdded: [],
        });
      }
      break;
    }
  }

  return rewrites;
}

export function mockFeedback(input: MockFeedbackInput): FeedbackOutput {
  const { job, metrics, scores } = input;
  const score = scores.overallScore;
  const mustTotal = job.mustHaveSkills.length;
  const mustMatched = scores.matchedMust.length;
  const missingMust = scores.missingMust;
  const missingNice = scores.missingNice;

  const fitPhrase =
    score >= 85
      ? "a very strong fit"
      : score >= 70
        ? "a strong fit with a few clear gaps"
        : score >= 55
          ? "a partial fit"
          : "a stretch right now";

  const coveragePhrase =
    mustTotal > 0
      ? `You cover ${mustMatched} of ${mustTotal} must-have skills`
      : "The job description did not expose a clean must-have list";

  const resumeLabel = input.resumeTitle.trim();
  const subject =
    resumeLabel && !/^resume$/i.test(resumeLabel)
      ? `This resume (${resumeLabel})`
      : "This resume";

  const summary = `${subject} is ${fitPhrase} for ${job.title} at ${job.company}. ${coveragePhrase}, and the weighted score is ${score}/100. ${
    missingMust.length
      ? `The fastest improvement is to add truthful evidence for ${joinSkills(missingMust, 2)}.`
      : "The remaining work is depth: stronger metrics and tighter role-specific framing."
  }`;

  const strengths: string[] = [];

  if (mustMatched > 0) {
    strengths.push(
      `Covers ${mustMatched} of ${mustTotal || mustMatched} must-have requirements, including ${joinSkills(scores.matchedMust)}.`,
    );
  }

  if (metrics.quantifiedBullets > 0) {
    strengths.push(
      `${metrics.quantifiedBullets} of ${metrics.bulletCount} bullets include a concrete number or outcome, which gives the claims weight.`,
    );
  }

  const passedAts = input.scores.ats.filter((check) => check.status === "pass").length;
  if (passedAts >= 5) {
    strengths.push(
      `${passedAts} of ${input.scores.ats.length} ATS checks pass, including format and section structure.`,
    );
  }

  if (scores.skills.bonus.length > 0) {
    strengths.push(
      `Brings additional depth in ${joinSkills(scores.skills.bonus.map((skill) => skill.name))} beyond the stated requirements.`,
    );
  }

  if (strengths.length < 2) {
    strengths.push(
      `The resume is readable and structured enough for an ATS to parse; word count is ${metrics.wordCount}.`,
    );
  }

  const gaps: FeedbackOutput["gaps"] = [];

  for (const skill of missingMust.slice(0, 3)) {
    gaps.push({
      title: `${skill} is not evidenced`,
      severity: mustMatched / Math.max(1, mustTotal) < 0.7 ? "high" : "medium",
      why: `${skill} is a must-have for this role, but it does not appear in the resume text or skills list.`,
      fix: `Add a real project or responsibility where you used ${skill}. Name the scope and the outcome. If you have not used it, build one small project and describe what it taught you.`,
    });
  }

  for (const skill of missingNice.slice(0, 2)) {
    gaps.push({
      title: `Preferred skill missing: ${skill}`,
      severity: "low",
      why: `${skill} appears as a nice-to-have in the description, so other candidates may use it as a tiebreaker.`,
      fix: `Only add ${skill} if you can support it with a concrete example. A short project bullet is better than a keyword in the skills list.`,
    });
  }

  if (gaps.length < 1) {
    gaps.push({
      title: "Deepen the role-specific evidence",
      severity: "low",
      why: "The core requirements are covered, so the next differentiator is the depth and specificity of the examples.",
      fix: "Pick the two strongest projects and add the constraint you worked under, the decision you made, and the measured result.",
    });
  }

  if (scores.scores.experience < 65) {
    gaps.push({
      title: "Experience level is below the target",
      severity: "medium",
      why: `The role asks for ${job.yearsRequired ? `${job.yearsRequired}+ years` : `a ${job.seniority} level`}, and the resume estimates ${metrics.yearsExperience} years.`,
      fix: "Emphasize scope and ownership over tenure: systems you owned, people you mentored, and decisions you led. Apply even if the years are close.",
    });
  }

  if (metrics.bulletCount > 0 && metrics.quantifiedBullets / metrics.bulletCount < 0.35) {
    gaps.push({
      title: "Too few quantified bullets",
      severity: "medium",
      why: `Only ${metrics.quantifiedBullets} of ${metrics.bulletCount} bullets contain a number, percentage, or currency value.`,
      fix: "Add a number to the bullets that already describe an outcome: time saved, users affected, error rate, revenue, or team size. Never invent one.",
    });
  }

  const sections = Object.entries(scores.sectionScores);
  const sectionFeedback: FeedbackOutput["sectionFeedback"] = sections.length
    ? sections.slice(0, 7).map(([section, value]) => ({
        section: sectionLabel(section),
        score: value,
        feedback: sectionProse(section, value),
      }))
    : [
        {
          section: "Resume",
          score: score,
          feedback:
            "No standard section headers were detected. Add Summary, Experience, Projects, Education, and Skills so both parsers and recruiters can scan the document.",
        },
      ];

  const matched = scores.matchedMust.length
    ? scores.matchedMust
    : scores.matchedNice;
  const yearsPhrase = metrics.yearsExperience
    ? `${metrics.yearsExperience}+ years of experience`
    : "hands-on project experience";

  const suggestedSummary = `${job.title} candidate with ${yearsPhrase}${
    matched.length ? ` across ${joinSkills(matched)}` : ""
  }. ${
    metrics.quantifiedBullets > 0
      ? "The resume already contains measurable outcomes; lead with those before describing responsibilities."
      : "The next step is to attach a measurable outcome to the strongest two or three projects."
  }${
    missingMust.length
      ? ` Add real evidence for ${joinSkills(missingMust, 2)} before applying.`
      : " Focus the summary on the requirements this role repeats most often."
  }`;

  const interviewQuestions = [
    ...missingMust.slice(0, 2).map(
      (skill) =>
        `How have you used ${skill} in practice, and what would your first week look like if you had to apply it here?`,
    ),
    ...(scores.matchedMust.length
      ? [
          `Walk us through the project where you used ${scores.matchedMust[0]}. What was the hardest constraint?`,
        ]
      : []),
    ...(job.responsibilities.length
      ? [
          `This role includes: ${job.responsibilities[0].replace(/\.$/, "")}. How would you approach that in your first 90 days?`,
        ]
      : []),
    "Tell us about a time you had to push back on a requirement. How did you decide, and what happened?",
  ].slice(0, 5);

  return {
    summary,
    strengths: strengths.slice(0, 5),
    gaps: gaps.slice(0, 5),
    sectionFeedback,
    bulletRewrites: mockRewrites(input.resumeText),
    suggestedSummary,
    interviewQuestions,
  };
}

export function mockJdExtraction(text: string, title?: string): JdExtraction {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return {
    title: title?.trim() || lines[0]?.slice(0, 120) || "Target role",
    company: null,
    seniority: /\bsenior\b/i.test(text)
      ? "senior"
      : /\bjunior\b/i.test(text)
        ? "junior"
        : "unknown",
    yearsRequired: null,
    mustHaveSkills: [],
    niceToHaveSkills: [],
    responsibilities: [],
  };
}

const TONE_OPENERS = {
  professional: "I am writing to apply for the",
  enthusiastic: "I was excited to see the",
  concise: "I am applying for the",
} as const;

export function mockCoverLetter(input: {
  candidateName: string;
  tone: keyof typeof TONE_OPENERS | string;
  jobTitle: string;
  company: string;
  matchedSkills: string[];
  strengths: string[];
  evidence: string[];
  summary: string;
}): CoverLetterOutput {
  const tone = (input.tone in TONE_OPENERS
    ? input.tone
    : "professional") as keyof typeof TONE_OPENERS;
  const skills = joinSkills(input.matchedSkills, 3);

  const opening = `${TONE_OPENERS[tone]} ${input.jobTitle} role at ${input.company}.`;

  const second = input.evidence.length
    ? `The clearest example of my fit is this: ${input.evidence[0]}`
    : input.matchedSkills.length
      ? `My recent work has centered on ${skills}, and I approach each project by tying technical decisions to outcomes the team can measure.`
      : `My background maps to the core requirements of this role, especially ${skills || "the technical areas in the description"}.`;

  const third =
    input.matchedSkills.length > 0
      ? `I would bring hands-on experience with ${skills} and a habit of tying technical work to outcomes the team can measure.`
      : `I would bring a bias toward clear scope and measurable outcomes, and I am ready to go deep on the tools this team relies on.`;

  const closing =
    tone === "concise"
      ? `I would welcome a short conversation about the role. Thank you for your time.`
      : `I would welcome the chance to discuss how my experience maps to the needs of the team. Thank you for your time and consideration.`;

  const body = `Dear Hiring Manager,\n\n${opening}\n\n${second}\n\n${third}\n\n${closing}\n\nSincerely,\n${input.candidateName}`;

  return {
    subject: `${input.jobTitle} · ${input.candidateName}`,
    body,
  };
}

export function mockComparisonVerdict(entries: Array<{
  title: string;
  overallScore: number;
  scores: Record<string, number>;
  matchedCount: number;
  missingCount: number;
}>): string {
  const sorted = [...entries].sort((a, b) => b.overallScore - a.overallScore);
  const best = sorted[0];
  const runnerUp = sorted[1];

  if (!best) return "Not enough resume versions to compare.";

  const runnerUpNote = runnerUp
    ? ` ${runnerUp.title} scores ${runnerUp.overallScore} and covers ${runnerUp.matchedCount} must-haves, but it trails on ${
        runnerUp.scores.skills < best.scores.skills
          ? "must-have skill coverage"
          : runnerUp.scores.impact < best.scores.impact
            ? "impact and clarity"
            : "the weighted total"
      }.`
    : "";

  return `${best.title} is the strongest version at ${best.overallScore}/100. It covers ${best.matchedCount} must-have requirements with ${best.missingCount} still missing, which gives it the best balance of relevance and evidence.${runnerUpNote} Use the winning version as the base, then borrow any concrete metrics from the other versions that are still true.`;
}
