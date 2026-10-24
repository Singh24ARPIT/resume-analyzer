import type { AnalysisSummary, Gap } from "@/lib/types";
import type { Viewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoAnalyses, demoStats, sampleAnalysis } from "@/lib/demo/data";
import { formatDate } from "@/lib/utils";

export interface DashboardData {
  stats: {
    totalAnalyses: number;
    averageScore: number;
    bestScore: number;
    resumeCount: number;
  };
  recent: AnalysisSummary[];
  trend: Array<{ label: string; score: number }>;
  topGaps: Gap[];
  isDemo: boolean;
  error?: boolean;
}

const emptyData: DashboardData = {
  stats: { totalAnalyses: 0, averageScore: 0, bestScore: 0, resumeCount: 0 },
  recent: [],
  trend: [],
  topGaps: [],
  isDemo: false,
};

type AnalysisRow = {
  id: string;
  overall_score: number;
  created_at: string;
  result: { gaps?: Gap[] } | null;
  job: { title: string | null; company: string | null } | null;
  resume: { title: string | null } | null;
};

export async function getDashboardData(viewer: Viewer): Promise<DashboardData> {
  if (viewer.type === "demo") {
    return {
      stats: demoStats,
      recent: demoAnalyses.slice(0, 8),
      trend: demoStats.trend,
      topGaps: sampleAnalysis.gaps.slice(0, 3),
      isDemo: true,
    };
  }

  const supabase = await createClient();

  const [analysesResult, resumeCountResult] = await Promise.all([
    supabase
      .from("analyses")
      .select(
        "id, overall_score, created_at, result, job:job_descriptions(title, company), resume:resumes(title)",
      )
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("resumes")
      .select("id", { count: "exact", head: true }),
  ]);

  if (analysesResult.error) {
    console.error("Failed to load dashboard analyses:", analysesResult.error.message);
    return { ...emptyData, isDemo: false, error: true };
  }

  const rows = (analysesResult.data ?? []) as unknown as AnalysisRow[];
  const scores = rows.map((row) => row.overall_score);

  const recent: AnalysisSummary[] = rows.slice(0, 8).map((row) => ({
    id: row.id,
    resumeTitle: row.resume?.title ?? "Resume",
    jobTitle: row.job?.title ?? "Untitled role",
    company: row.job?.company ?? "Unknown company",
    overallScore: row.overall_score,
    createdAt: row.created_at,
  }));

  const trend = [...rows]
    .slice(0, 8)
    .reverse()
    .map((row) => ({
      label: formatDate(row.created_at, {
        month: "short",
        day: "numeric",
        year: undefined,
      }),
      score: row.overall_score,
    }));

  return {
    stats: {
      totalAnalyses: rows.length,
      averageScore: scores.length
        ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length)
        : 0,
      bestScore: scores.length ? Math.max(...scores) : 0,
      resumeCount: resumeCountResult.count ?? 0,
    },
    recent,
    trend,
    topGaps: rows[0]?.result?.gaps?.slice(0, 3) ?? [],
    isDemo: false,
  };
}
