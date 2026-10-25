import type {
  AnalysisResult,
  AnalysisSummary,
  CoverLetterRecord,
  JobRecord,
  ResumeRecord,
} from "@/lib/types";

export const ANALYSIS_STORAGE_PREFIX = "resume-analyzer:analysis:";
export const RESUME_STORAGE_PREFIX = "resume-analyzer:resume:";
export const JOB_STORAGE_PREFIX = "resume-analyzer:job:";
export const LETTER_STORAGE_PREFIX = "resume-analyzer:letter:";

export interface LocalResume {
  resume: ResumeRecord;
  text: string;
}

export interface LocalJob {
  job: JobRecord;
  text: string;
}

function isBrowser() {
  return typeof window !== "undefined";
}

function listStored<T>(prefix: string): T[] {
  if (!isBrowser()) return [];
  const results: T[] = [];

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) results.push(JSON.parse(raw) as T);
    } catch {
      // Ignore malformed entries.
    }
  }

  return results;
}

function writeStored(key: string, value: unknown) {
  if (!isBrowser()) return false;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function removeStored(key: string) {
  if (!isBrowser()) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore.
  }
}

export function saveLocalAnalysis(result: AnalysisResult) {
  writeStored(`${ANALYSIS_STORAGE_PREFIX}${result.id}`, result);
}

export function loadLocalAnalysis(id: string): AnalysisResult | null {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(`${ANALYSIS_STORAGE_PREFIX}${id}`);
    if (!raw) return null;
    return JSON.parse(raw) as AnalysisResult;
  } catch {
    return null;
  }
}

export function listLocalAnalyses(): AnalysisResult[] {
  return listStored<AnalysisResult>(ANALYSIS_STORAGE_PREFIX).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function localAnalysesToSummaries(
  analyses: AnalysisResult[],
): AnalysisSummary[] {
  return analyses.map((analysis) => ({
    id: analysis.id,
    resumeTitle: analysis.resume.title,
    jobTitle: analysis.job.title,
    company: analysis.job.company,
    overallScore: analysis.overallScore,
    createdAt: analysis.createdAt,
  }));
}

export function deleteLocalAnalysis(id: string) {
  removeStored(`${ANALYSIS_STORAGE_PREFIX}${id}`);
}

export function saveLocalResume(entry: LocalResume) {
  return writeStored(`${RESUME_STORAGE_PREFIX}${entry.resume.id}`, entry);
}

export function listLocalResumes(): LocalResume[] {
  return listStored<LocalResume>(RESUME_STORAGE_PREFIX).sort(
    (a, b) =>
      new Date(b.resume.createdAt).getTime() -
      new Date(a.resume.createdAt).getTime(),
  );
}

export function deleteLocalResume(id: string) {
  removeStored(`${RESUME_STORAGE_PREFIX}${id}`);
}

export function saveLocalJob(entry: LocalJob) {
  return writeStored(`${JOB_STORAGE_PREFIX}${entry.job.id}`, entry);
}

export function listLocalJobs(): LocalJob[] {
  return listStored<LocalJob>(JOB_STORAGE_PREFIX).sort(
    (a, b) =>
      new Date(b.job.createdAt).getTime() - new Date(a.job.createdAt).getTime(),
  );
}

export function deleteLocalJob(id: string) {
  removeStored(`${JOB_STORAGE_PREFIX}${id}`);
}

export function saveLocalLetter(letter: CoverLetterRecord) {
  return writeStored(`${LETTER_STORAGE_PREFIX}${letter.id}`, letter);
}

export function listLocalLetters(): CoverLetterRecord[] {
  return listStored<CoverLetterRecord>(LETTER_STORAGE_PREFIX).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function deleteLocalLetter(id: string) {
  removeStored(`${LETTER_STORAGE_PREFIX}${id}`);
}

export function clearLocalWorkspace() {
  if (!isBrowser()) return;
  const prefixes = [
    ANALYSIS_STORAGE_PREFIX,
    RESUME_STORAGE_PREFIX,
    JOB_STORAGE_PREFIX,
    LETTER_STORAGE_PREFIX,
  ];

  try {
    const keys: string[] = [];
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (key && prefixes.some((prefix) => key.startsWith(prefix))) {
        keys.push(key);
      }
    }
    keys.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore.
  }
}

export function countLocalWorkspace() {
  if (!isBrowser()) {
    return { analyses: 0, resumes: 0, jobs: 0, letters: 0 };
  }

  return {
    analyses: listLocalAnalyses().length,
    resumes: listLocalResumes().length,
    jobs: listLocalJobs().length,
    letters: listLocalLetters().length,
  };
}
