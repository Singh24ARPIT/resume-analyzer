import type { Viewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  demoAnalyses,
  demoJobs,
  demoResumes,
  sampleCoverLetter,
} from "@/lib/demo/data";
import type {
  AnalysisSummary,
  CoverLetterRecord,
  JobRecord,
  ResumeRecord,
} from "@/lib/types";

export interface WorkspaceCounts {
  analyses: number;
  resumes: number;
  jobs: number;
  letters: number;
}

export async function getWorkspaceCounts(
  viewer: Viewer,
): Promise<WorkspaceCounts> {
  if (viewer.type === "demo") {
    return {
      analyses: demoAnalyses.length,
      resumes: demoResumes.length,
      jobs: demoJobs.length,
      letters: 1,
    };
  }

  const supabase = await createClient();
  const [analyses, resumes, jobs, letters] = await Promise.all([
    supabase.from("analyses").select("id", { count: "exact", head: true }),
    supabase.from("resumes").select("id", { count: "exact", head: true }),
    supabase
      .from("job_descriptions")
      .select("id", { count: "exact", head: true }),
    supabase.from("cover_letters").select("id", { count: "exact", head: true }),
  ]);

  return {
    analyses: analyses.count ?? 0,
    resumes: resumes.count ?? 0,
    jobs: jobs.count ?? 0,
    letters: letters.count ?? 0,
  };
}

export async function getResumeLibrary(viewer: Viewer): Promise<ResumeRecord[]> {
  if (viewer.type === "demo") return demoResumes;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("resumes")
    .select(
      "id, title, file_name, file_path, file_type, file_size, word_count, skills, created_at",
    )
    .eq("user_id", viewer.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load resumes:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    fileName: row.file_name,
    filePath: row.file_path,
    fileType: row.file_type,
    fileSize: Number(row.file_size ?? 0),
    wordCount: row.word_count ?? 0,
    skills: (row.skills as string[] | null) ?? [],
    createdAt: row.created_at,
  }));
}

export async function getJobLibrary(viewer: Viewer): Promise<JobRecord[]> {
  if (viewer.type === "demo") return demoJobs;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("job_descriptions")
    .select("id, title, company, source_url, must_have_skills, created_at")
    .eq("user_id", viewer.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Failed to load job descriptions:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    company: row.company,
    sourceUrl: row.source_url,
    mustHaveSkills: (row.must_have_skills as string[] | null) ?? [],
    createdAt: row.created_at,
  }));
}

export async function getAnalysisSummaries(
  viewer: Viewer,
): Promise<AnalysisSummary[]> {
  if (viewer.type === "demo") return demoAnalyses;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analyses")
    .select(
      "id, overall_score, created_at, job:job_descriptions(title, company), resume:resumes(title)",
    )
    .eq("user_id", viewer.user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error("Failed to load analyses:", error.message);
    return [];
  }

  type Row = {
    id: string;
    overall_score: number;
    created_at: string;
    job: { title: string | null; company: string | null } | null;
    resume: { title: string | null } | null;
  };

  return ((data ?? []) as unknown as Row[]).map((row) => ({
    id: row.id,
    resumeTitle: row.resume?.title ?? "Resume",
    jobTitle: row.job?.title ?? "Untitled role",
    company: row.job?.company ?? "Unknown company",
    overallScore: row.overall_score,
    createdAt: row.created_at,
  }));
}

export async function getCoverLetterLibrary(
  viewer: Viewer,
): Promise<CoverLetterRecord[]> {
  if (viewer.type === "demo") return [sampleCoverLetter];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cover_letters")
    .select("id, analysis_id, tone, title, body, created_at")
    .eq("user_id", viewer.user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    console.error("Failed to load cover letters:", error.message);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    analysisId: row.analysis_id,
    tone: row.tone as CoverLetterRecord["tone"],
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
  }));
}
