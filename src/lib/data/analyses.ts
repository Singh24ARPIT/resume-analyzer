import type { AnalysisResult, SubScores } from "@/lib/types";
import type { Viewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { demoAnalyses, sampleAnalysis } from "@/lib/demo/data";
import { scoreBand } from "@/lib/utils";

export const LOCAL_ANALYSIS_PREFIX = "resume-analyzer:analysis:";

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function demoAnalysis(id: string): AnalysisResult | null {
  const summary = demoAnalyses.find((item) => item.id === id);
  if (!summary) return null;

  const delta = summary.overallScore - sampleAnalysis.overallScore;
  const scores = Object.fromEntries(
    Object.entries(sampleAnalysis.scores).map(([key, value]) => [
      key,
      clampScore(value + delta),
    ]),
  ) as SubScores;

  return {
    ...sampleAnalysis,
    id: summary.id,
    createdAt: summary.createdAt,
    overallScore: summary.overallScore,
    scores,
    verdict: scoreBand(summary.overallScore).label,
    summary:
      summary.id === "sample"
        ? sampleAnalysis.summary
        : `${sampleAnalysis.summary} This variant is part of the demo dataset and reuses the sample narrative with a score adjusted for the role.`,
    job: {
      ...sampleAnalysis.job,
      title: summary.jobTitle,
      company: summary.company,
      sourceUrl: null,
    },
    resume: {
      ...sampleAnalysis.resume,
      title: summary.resumeTitle,
    },
    model: "resume-analyzer-demo",
  };
}

type AnalysisRow = {
  id: string;
  created_at: string;
  result: AnalysisResult | null;
  job: { title: string | null; company: string | null } | null;
};

export async function getAnalysisById(
  id: string,
  viewer: Viewer,
): Promise<AnalysisResult | null> {
  if (viewer.type === "demo") {
    return demoAnalysis(id);
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analyses")
    .select("id, created_at, result, job:job_descriptions(title, company)")
    .eq("id", id)
    .eq("user_id", viewer.user.id)
    .maybeSingle();

  if (error) {
    console.error("Failed to load analysis:", error.message);
    return null;
  }

  if (!data) return null;

  const row = data as unknown as AnalysisRow;
  if (!row.result) return null;

  return {
    ...row.result,
    id: row.id,
    createdAt: row.created_at,
    job: {
      ...row.result.job,
      title: row.job?.title ?? row.result.job.title,
      company: row.job?.company ?? row.result.job.company,
    },
  };
}
