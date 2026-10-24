export type ScoreKey =
  | "skills"
  | "experience"
  | "semantic"
  | "preferred"
  | "ats"
  | "impact";

export type SubScores = Record<ScoreKey, number>;

export type SkillCategory =
  | "language"
  | "framework"
  | "cloud"
  | "data"
  | "ml"
  | "tool"
  | "soft";

export interface SkillMatch {
  name: string;
  category?: SkillCategory;
  evidence?: string;
}

export interface SkillAnalysis {
  matched: SkillMatch[];
  missing: SkillMatch[];
  bonus: SkillMatch[];
}

export interface KeywordRow {
  term: string;
  importance: "must" | "nice";
  inResume: boolean;
  count: number;
}

export type CheckStatus = "pass" | "warn" | "fail";

export interface AtsCheck {
  id: string;
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface Gap {
  title: string;
  severity: "high" | "medium" | "low";
  why: string;
  fix: string;
}

export interface SectionFeedback {
  section: string;
  score: number;
  feedback: string;
}

export interface BulletRewrite {
  original: string;
  improved: string;
  rationale: string;
  keywordsAdded?: string[];
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  resume: {
    id?: string;
    title: string;
    fileName: string;
    wordCount: number;
  };
  job: {
    id?: string;
    title: string;
    company: string;
    sourceUrl?: string | null;
  };
  overallScore: number;
  scores: SubScores;
  verdict: string;
  summary: string;
  skills: SkillAnalysis;
  keywords: KeywordRow[];
  ats: AtsCheck[];
  strengths: string[];
  gaps: Gap[];
  sectionFeedback: SectionFeedback[];
  bulletRewrites: BulletRewrite[];
  suggestedSummary: string;
  interviewQuestions: string[];
  model: string;
  aiFallback?: boolean;
}

export interface ResumeRecord {
  id: string;
  title: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  wordCount: number;
  skills: string[];
  createdAt: string;
}

export interface JobRecord {
  id: string;
  title: string;
  company: string;
  sourceUrl: string | null;
  createdAt: string;
  mustHaveSkills: string[];
}

export interface AnalysisSummary {
  id: string;
  resumeTitle: string;
  jobTitle: string;
  company: string;
  overallScore: number;
  createdAt: string;
}

export interface AnalysisRecord extends AnalysisSummary {
  result: AnalysisResult;
}

export interface CoverLetterRecord {
  id: string;
  analysisId: string;
  tone: CoverLetterTone;
  title: string;
  body: string;
  createdAt: string;
}

export type CoverLetterTone = "professional" | "enthusiastic" | "concise";

export type Seniority =
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "principal"
  | "unknown";

export interface ParsedJob {
  title: string;
  company: string;
  seniority: Seniority;
  yearsRequired: number | null;
  mustHaveSkills: string[];
  niceToHaveSkills: string[];
  responsibilities: string[];
  keywords: string[];
  rawText: string;
  sourceUrl?: string | null;
}

export interface ResumeMetrics {
  wordCount: number;
  bulletCount: number;
  quantifiedBullets: number;
  actionVerbBullets: number;
  yearsExperience: number;
  sections: string[];
  emailPresent: boolean;
  phonePresent: boolean;
}

export interface ParsedResume {
  sections: Record<string, string>;
  skills: string[];
  metrics: ResumeMetrics;
}

export interface ComparisonEntry {
  resumeId: string;
  resumeTitle: string;
  overallScore: number;
  scores: SubScores;
  matchedCount: number;
  missingCount: number;
  atsScore: number;
}

export interface ComparisonResult {
  id: string;
  jobTitle: string;
  company: string;
  entries: ComparisonEntry[];
  bestResumeId: string;
  verdict: string;
  createdAt: string;
}
