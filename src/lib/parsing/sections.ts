import type { ResumeMetrics } from "@/lib/types";

const SECTION_ALIASES: Record<string, string[]> = {
  summary: [
    "summary",
    "professional summary",
    "profile",
    "professional profile",
    "about",
    "about me",
    "objective",
    "career objective",
  ],
  experience: [
    "experience",
    "work experience",
    "professional experience",
    "employment",
    "employment history",
    "work history",
    "relevant experience",
  ],
  projects: [
    "projects",
    "selected projects",
    "personal projects",
    "key projects",
    "portfolio",
    "side projects",
  ],
  education: ["education", "academics", "academic background", "qualifications"],
  skills: [
    "skills",
    "technical skills",
    "core skills",
    "skills & tools",
    "skills and tools",
    "technologies",
    "tech stack",
    "technical proficiency",
    "competencies",
    "tools",
  ],
  certifications: [
    "certifications",
    "certificates",
    "licenses",
    "awards",
    "achievements",
    "honors",
    "honours",
  ],
  publications: ["publications", "research", "papers"],
  volunteer: ["volunteer", "volunteering", "community"],
  languages: ["languages", "language proficiency"],
};

const aliasToSection = new Map<string, string>();
for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
  aliasToSection.set(section, section);
  aliases.forEach((alias) => aliasToSection.set(alias, section));
}

export const SECTION_LABELS: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  skills: "Skills",
  certifications: "Certifications",
  publications: "Publications",
  volunteer: "Volunteer",
  languages: "Languages",
  resume: "Resume",
};

function normalizeHeaderLine(line: string) {
  return line
    .replace(/^[\s#>*\-•●▪◦‣·]+/, "")
    .replace(/^\d+[.)]\s+/, "")
    .replace(/[:\s]+$/, "")
    .replace(/\s+/g, " ")
    .toLowerCase()
    .trim();
}

export interface SectionsResult {
  sections: Record<string, string>;
  detected: string[];
}

export function parseSections(text: string): SectionsResult {
  const lines = text.split(/\r?\n/);
  const sections: Record<string, string> = {};
  const detected: string[] = [];
  let current: string | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (current && sections[current]) sections[current] += "\n";
      continue;
    }

    const normalized = normalizeHeaderLine(trimmed);
    const words = normalized.split(" ").filter(Boolean);
    const directSection =
      normalized.length <= 42 && words.length <= 5
        ? aliasToSection.get(normalized)
        : undefined;

    if (directSection) {
      current = directSection;
      if (!sections[current]) sections[current] = "";
      if (!detected.includes(current)) detected.push(current);
      continue;
    }

    // "Technical Skills: React, TypeScript" on one line.
    const inlineMatch = trimmed.match(/^([A-Za-z &/]{3,40}):\s*(.+)$/);
    if (inlineMatch) {
      const inlineSection = aliasToSection.get(
        normalizeHeaderLine(inlineMatch[1]),
      );
      if (inlineSection) {
        current = inlineSection;
        sections[current] = sections[current]
          ? `${sections[current]}\n${inlineMatch[2]}`
          : inlineMatch[2];
        if (!detected.includes(current)) detected.push(current);
        continue;
      }
    }

    if (current) {
      sections[current] = sections[current]
        ? `${sections[current]}\n${trimmed}`
        : trimmed;
    }
  }

  for (const key of Object.keys(sections)) {
    sections[key] = sections[key].trim();
    if (!sections[key]) delete sections[key];
  }

  if (Object.keys(sections).length === 0) {
    return { sections: { resume: text.trim() }, detected: [] };
  }

  return { sections, detected };
}

const MONTHS: Record<string, number> = {
  jan: 0,
  january: 0,
  feb: 1,
  february: 1,
  mar: 2,
  march: 2,
  apr: 3,
  april: 3,
  may: 4,
  jun: 5,
  june: 5,
  jul: 6,
  july: 6,
  aug: 7,
  august: 7,
  sep: 8,
  sept: 8,
  september: 8,
  oct: 9,
  october: 9,
  nov: 10,
  november: 10,
  dec: 11,
  december: 11,
};

function monthValue(value?: string) {
  if (!value) return 0;
  const key = value.toLowerCase().replace(/[^a-z]/g, "");
  return (MONTHS[key] ?? 0) / 12;
}

export function estimateYearsExperience(text: string): number {
  const rangePattern =
    /\b(?:(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[a-z]*\.?\s+)?((?:19|20)\d{2})\s*(?:-|–|—|to|until)\s*(?:(present|current|now)|(?:(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:t|tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[a-z]*\.?\s+)?((?:19|20)\d{2}))\b/gi;

  const now = new Date();
  const currentYear = now.getFullYear() + now.getMonth() / 12;
  const ranges: Array<[number, number]> = [];

  for (const match of text.matchAll(rangePattern)) {
    const startYear = Number(match[2]);
    const start = startYear + monthValue(match[1]);
    const end = match[3]
      ? currentYear
      : Number(match[5]) + (match[4] ? monthValue(match[4]) : 0.99);

    if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) {
      continue;
    }

    // Ignore implausible or education-style ranges.
    if (end - start > 45) continue;
    ranges.push([start, end]);
  }

  let total = 0;
  if (ranges.length) {
    const sorted = ranges.sort((a, b) => a[0] - b[0]);
    const merged: Array<[number, number]> = [];

    for (const range of sorted) {
      const last = merged[merged.length - 1];
      if (!last || range[0] > last[1] + 0.05) {
        merged.push([...range]);
      } else {
        last[1] = Math.max(last[1], range[1]);
      }
    }

    total = merged.reduce((sum, [start, end]) => sum + (end - start), 0);
  }

  const statedMatch = text.match(
    /(\d{1,2})\+?\s*(?:years?|yrs?)\s+(?:of\s+)?(?:professional\s+|relevant\s+|hands-on\s+|industry\s+)?experience/i,
  );
  const stated = statedMatch ? Number(statedMatch[1]) : 0;

  const estimated = Math.max(total, stated);
  if (!estimated) return 0;
  return Math.min(45, Math.round(estimated * 2) / 2);
}

const ACTION_VERBS = new Set(
  [
    "led",
    "built",
    "shipped",
    "launched",
    "designed",
    "developed",
    "created",
    "implemented",
    "architected",
    "rebuilt",
    "improved",
    "reduced",
    "increased",
    "grew",
    "cut",
    "optimized",
    "migrated",
    "scaled",
    "automated",
    "delivered",
    "owned",
    "drove",
    "managed",
    "mentored",
    "coached",
    "collaborated",
    "partnered",
    "introduced",
    "established",
    "transformed",
    "streamlined",
    "accelerated",
    "resolved",
    "fixed",
    "refactored",
    "tested",
    "analyzed",
    "researched",
    "presented",
    "coordinated",
    "spearheaded",
    "initiated",
    "founded",
    "achieved",
  ].map((verb) => verb.toLowerCase()),
);

function stripBullet(value: string) {
  return value
    .replace(/^[•●▪◦‣·*\-–—]\s*/, "")
    .replace(/^\d+[.)]\s+/, "")
    .trim();
}

export function measureBullets(text: string): {
  bulletCount: number;
  quantifiedBullets: number;
  actionVerbBullets: number;
} {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  let bullets = lines
    .filter((line) => /^[•●▪◦‣·*\-–—]\s+/.test(line))
    .map(stripBullet)
    .filter((line) => line.length > 12);

  if (bullets.length < 3) {
    bullets = lines
      .filter(
        (line) =>
          line.length >= 35 &&
          line.length <= 400 &&
          /^[A-Z0-9]/.test(line) &&
          !/^[A-Z\s&/]{8,}$/.test(line) &&
          !line.includes("@") &&
          !/^https?:\/\//i.test(line),
      )
      .map(stripBullet)
      .slice(0, 40);
  }

  const actionVerbBullets = bullets.filter((bullet) => {
    const firstWord = bullet
      .split(/\s+/)[0]
      ?.toLowerCase()
      .replace(/[^a-z]/g, "");
    return firstWord ? ACTION_VERBS.has(firstWord) : false;
  }).length;

  const quantifiedBullets = bullets.filter((bullet) =>
    /(?:\d|[$€£])/.test(bullet),
  ).length;

  return {
    bulletCount: bullets.length,
    quantifiedBullets,
    actionVerbBullets,
  };
}

export function redactPII(text: string) {
  return text
    .replace(/\bhttps?:\/\/[^\s<>"')]+/gi, "[link]")
    .replace(/\bwww\.[^\s<>"')]+/gi, "[link]")
    .replace(/\b[\w.+-]+@[\w-]+\.[\w.-]+\b/g, "[email]")
    .replace(
      /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/g,
      "[phone]",
    )
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "you",
  "your",
  "our",
  "are",
  "will",
  "that",
  "this",
  "from",
  "have",
  "has",
  "had",
  "was",
  "were",
  "been",
  "being",
  "not",
  "but",
  "all",
  "can",
  "who",
  "what",
  "when",
  "where",
  "why",
  "how",
  "team",
  "teams",
  "work",
  "working",
  "role",
  "job",
  "company",
  "experience",
  "years",
  "year",
  "including",
  "using",
  "use",
  "used",
  "about",
  "into",
  "over",
  "under",
  "more",
  "than",
  "their",
  "they",
  "them",
  "its",
  "it's",
  "as",
  "at",
  "by",
  "in",
  "of",
  "on",
  "or",
  "to",
  "up",
  "we",
  "is",
  "be",
  "an",
  "a",
  "i",
]);

export function tokenize(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .split(/\s+/)
    .map((token) => token.replace(/^\.+|\.+$/g, ""))
    .filter((token) => token.length > 2 && !STOPWORDS.has(token));
}

export function buildResumeMetrics(
  text: string,
  sections: Record<string, string>,
): ResumeMetrics {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const bullets = measureBullets(text);

  return {
    wordCount: words,
    ...bullets,
    yearsExperience: estimateYearsExperience(text),
    sections: Object.keys(sections),
    emailPresent: /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/.test(text),
    phonePresent:
      /(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3,4}[\s.-]?\d{4}\b/.test(
        text,
      ),
  };
}
