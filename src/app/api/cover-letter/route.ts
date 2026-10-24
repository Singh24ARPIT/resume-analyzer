import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getAnalysisById } from "@/lib/data/analyses";
import { generateCoverLetter } from "@/lib/ai";
import type { AnalysisResult, CoverLetterRecord, CoverLetterTone } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 45;

const TONES: CoverLetterTone[] = ["professional", "enthusiastic", "concise"];

function looksLikeAnalysis(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AnalysisResult>;
  return Boolean(
    candidate.job?.title &&
      candidate.resume?.title &&
      candidate.skills?.matched &&
      candidate.skills?.missing &&
      candidate.scores,
  );
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json(
      { error: "Sign in to generate a cover letter." },
      { status: 401 },
    );
  }

  let body: {
    analysisId?: unknown;
    analysis?: unknown;
    tone?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const tone = TONES.includes(body.tone as CoverLetterTone)
    ? (body.tone as CoverLetterTone)
    : "professional";

  const analysisId =
    typeof body.analysisId === "string" ? body.analysisId.trim() : "";

  let analysis: AnalysisResult | null = null;

  if (looksLikeAnalysis(body.analysis)) {
    analysis = body.analysis;
  } else if (analysisId) {
    analysis = await getAnalysisById(analysisId, viewer);
  }

  if (!analysis) {
    return NextResponse.json(
      { error: "Pick an analysis first. Cover letters are grounded in a report." },
      { status: 404 },
    );
  }

  let jobText: string | undefined;

  if (viewer.type === "user" && analysis.job.id) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("job_descriptions")
      .select("raw_text")
      .eq("id", analysis.job.id)
      .eq("user_id", viewer.user.id)
      .maybeSingle();
    jobText = (data?.raw_text as string | null) ?? undefined;
  }

  try {
    const generation = await generateCoverLetter({
      candidateName: viewer.name,
      tone,
      jobTitle: analysis.job.title,
      company: analysis.job.company,
      matchedSkills: analysis.skills.matched.map((skill) => skill.name),
      missingSkills: analysis.skills.missing.map((skill) => skill.name),
      strengths: analysis.strengths,
      evidence: analysis.bulletRewrites.map((rewrite) => rewrite.improved),
      summary: analysis.summary,
      analysis: {
        job: analysis.job,
        summary: analysis.summary,
        strengths: analysis.strengths,
        skills: analysis.skills,
        bulletRewrites: analysis.bulletRewrites,
        suggestedSummary: analysis.suggestedSummary,
        resume: analysis.resume,
      },
      jobText,
    });

    const createdAt = new Date().toISOString();
    const id =
      viewer.type === "demo"
        ? `local-letter-${crypto.randomUUID()}`
        : crypto.randomUUID();
    const title = `${analysis.job.title} · ${analysis.job.company}`;

    const letter: CoverLetterRecord = {
      id,
      analysisId: analysis.id,
      tone,
      title,
      body: generation.letter.body,
      createdAt,
    };

    if (viewer.type === "user") {
      const supabase = await createClient();
      const { error } = await supabase.from("cover_letters").insert({
        id,
        user_id: viewer.user.id,
        analysis_id: analysis.id,
        tone,
        title,
        body: generation.letter.body,
        model: generation.model,
        ai_fallback: generation.fallback,
      });

      if (error) {
        console.error("Cover letter save failed:", error.message);
        return NextResponse.json(
          { error: "The letter was written but could not be saved." },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      letter,
      local: viewer.type === "demo",
      model: generation.model,
      fallback: generation.fallback,
    });
  } catch (error) {
    console.error("Cover letter failed:", error);
    return NextResponse.json(
      { error: "The cover letter could not be generated. Try again." },
      { status: 500 },
    );
  }
}
