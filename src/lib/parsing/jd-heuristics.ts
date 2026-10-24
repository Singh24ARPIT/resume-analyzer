import type { ParsedJob, Seniority } from "@/lib/types";
import { detectSkills } from "@/lib/scoring/taxonomy";
import { tokenize } from "@/lib/parsing/sections";

const MUST_RE =
  /\b(required|requirement|must[- ]?have|minimum|proficien|expert|strong|solid|hands[- ]on|you have)\b/i;
const NICE_RE =
  /\b(preferred|nice[- ]to[- ]have|a plus|bonus|familiar|desirable|ideally|good to have)\b/i;

const GENERIC_JD_WORDS = new Set([
  "looking",
  "join",
  "help",
  "build",
  "building",
  "world",
  "people",
  "best",
  "great",
  "love",
  "want",
  "need",
  "make",
  "like",
  "well",
  "also",
  "across",
  "within",
  "ability",
  "strong",
  "excellent",
  "high",
  "new",
  "fast",
  "fast-paced",
  "environment",
  "opportunity",
  "candidate",
  "applicants",
  "position",
  "responsibilities",
  "requirements",
  "qualifications",
  "preferred",
  "required",
  "benefits",
  "salary",
  "apply",
  "remote",
  "hybrid",
  "onsite",
  "full-time",
  "fulltime",
  "years",
  "plus",
  "etc",
]);

function inferYears(text: string): number | null {
  const matches = Array.from(
    text.matchAll(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?/gi),
  )
    .map((match) => Number(match[1]))
    .filter((value) => value > 0 && value <= 25);

  if (!matches.length) return null;
  return Math.max(...matches);
}

function inferSeniority(
  text: string,
  title: string,
  years: number | null,
): Seniority {
  const haystack = `${title}\n${text}`;

  if (/\bintern(?:ship)?\b/i.test(title)) return "intern";
  if (/\b(principal|architect|distinguished)\b/i.test(title)) return "principal";
  if (/\b(staff|lead|manager|head of|director)\b/i.test(title)) return "staff";
  if (/\b(senior|sr\.?)\b/i.test(title)) return "senior";
  if (/\b(junior|jr\.?|entry[- ]level|new grad|graduate)\b/i.test(title)) {
    return "junior";
  }
  if (/\b(mid[- ]level|intermediate)\b/i.test(title)) return "mid";

  if (/\b(principal|distinguished)\b/i.test(haystack)) return "principal";
  if (/\b(staff engineer|technical lead|team lead)\b/i.test(haystack)) {
    return "staff";
  }
  if (/\bsenior\b/i.test(haystack)) return "senior";
  if (/\bjuni(or|or)\b/i.test(haystack)) return "junior";

  if (years !== null) {
    if (years >= 5) return "senior";
    if (years >= 2) return "mid";
  }

  return "unknown";
}

function cleanTitle(value: string) {
  return value
    .replace(/^job application for\s+/i, "")
    .replace(/\s*[|–—]\s*[^|–—]{2,45}$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

function inferTitle(text: string, provided?: string | null) {
  if (provided?.trim()) return cleanTitle(provided);

  const firstLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length >= 3 && line.length <= 100);

  return cleanTitle(firstLine ?? "Target role") || "Target role";
}

function inferResponsibilities(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/^[•●▪◦‣·*\-–—]\s*/, "").trim())
    .filter(
      (line) =>
        line.length >= 30 &&
        line.length <= 320 &&
        !/^(responsibilities|requirements|qualifications|what you'?ll do|about (the role|us)|benefits)[:\s]*$/i.test(
          line,
        ),
    );

  if (lines.length < 3) {
    return text
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length >= 35 && sentence.length <= 240)
      .slice(0, 6);
  }

  return lines.slice(0, 6);
}

function inferKeywordFallback(text: string) {
  const counts = new Map<string, number>();
  for (const token of tokenize(text)) {
    if (token.length < 3 || GENERIC_JD_WORDS.has(token)) continue;
    counts.set(token, (counts.get(token) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([token]) => token);
}

export function inferJobFromText(input: {
  text: string;
  title?: string | null;
  company?: string | null;
  sourceUrl?: string | null;
}): ParsedJob {
  const text = input.text.replace(/\r\n?/g, "\n").trim();
  const title = inferTitle(text, input.title);
  const yearsRequired = inferYears(text);
  const seniority = inferSeniority(text, title, yearsRequired);

  const hits = detectSkills(text);
  const mustHave: string[] = [];
  const niceToHave: string[] = [];
  const unclassified: string[] = [];

  for (const hit of hits) {
    const evidence = hit.evidence.toLowerCase();
    if (NICE_RE.test(evidence)) {
      niceToHave.push(hit.skill.name);
    } else if (MUST_RE.test(evidence)) {
      mustHave.push(hit.skill.name);
    } else {
      unclassified.push(hit.skill.name);
    }
  }

  for (const skill of unclassified) {
    if (mustHave.length < 7) mustHave.push(skill);
    else if (niceToHave.length < 6) niceToHave.push(skill);
  }

  if (mustHave.length === 0 && niceToHave.length === 0) {
    const fallback = inferKeywordFallback(text);
    mustHave.push(...fallback.slice(0, 7));
    niceToHave.push(...fallback.slice(7, 12));
  }

  const unique = (values: string[]) => Array.from(new Set(values));

  return {
    title,
    company: input.company?.trim() || "Company not specified",
    seniority,
    yearsRequired,
    mustHaveSkills: unique(mustHave).slice(0, 9),
    niceToHaveSkills: unique(niceToHave)
      .filter((skill) => !mustHave.includes(skill))
      .slice(0, 7),
    responsibilities: inferResponsibilities(text),
    keywords: unique([...mustHave, ...niceToHave]).slice(0, 16),
    rawText: text,
    sourceUrl: input.sourceUrl ?? null,
  };
}
