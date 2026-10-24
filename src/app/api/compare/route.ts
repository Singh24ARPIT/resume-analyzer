import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { runAnalysis } from "@/lib/analysis/run";
import { extractResumeText, ResumeParseError } from "@/lib/parsing/resume";
import { generateComparisonVerdict } from "@/lib/ai";
import type { ComparisonEntry, ComparisonResult, SubScores } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ResumeInput {
  title: string;
  fileName: string;
  text: string;
}

function parseResumes(value: unknown): ResumeInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      const record = (item ?? {}) as Record<string, unknown>;
      return {
        title:
          typeof record.title === "string" && record.title.trim()
            ? record.title.trim().slice(0, 120)
            : `Resume ${index + 1}`,
        fileName:
          typeof record.fileName === "string" && record.fileName.trim()
            ? record.fileName.trim().slice(0, 180)
            : `resume-${index + 1}.pdf`,
        text: typeof record.text === "string" ? record.text.trim() : "",
      };
    })
    .filter((resume) => resume.text.length >= 80);
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in to compare resumes." }, { status: 401 });
  }

  let body: {
    jobText?: unknown;
    jobTitle?: unknown;
    jobCompany?: unknown;
    resumes?: unknown;
  };

  const contentType = request.headers.get("content-type") ?? "";
  let jobText = "";
  let jobTitle = "";
  let jobCompany = "";
  let resumes: ResumeInput[] = [];

  if (contentType.includes("multipart/form-data")) {
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: "That upload could not be read." },
        { status: 400 },
      );
    }

    const readField = (name: string) => {
      const value = formData.get(name);
      return typeof value === "string" ? value.trim() : "";
    };

    jobText = readField("jobText");
    jobTitle = readField("jobTitle");
    jobCompany = readField("jobCompany");

    const files = [
      ...formData.getAll("files"),
      ...formData.getAll("resume"),
    ].filter((entry): entry is File => entry instanceof File && entry.size > 0);

    if (files.length > 4) {
      return NextResponse.json(
        { error: "Compare at most four resumes at a time." },
        { status: 400 },
      );
    }

    try {
      for (const file of files) {
        const parsed = await extractResumeText(file);
        resumes.push({
          title: parsed.fileName
            .replace(/\.[^.]+$/, "")
            .replace(/[_-]+/g, " ")
            .trim() || "Resume",
          fileName: parsed.fileName,
          text: parsed.text,
        });
      }
    } catch (error) {
      if (error instanceof ResumeParseError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      return NextResponse.json(
        { error: "One of those files could not be read." },
        { status: 400 },
      );
    }
  } else {
    try {
      body = (await request.json()) as typeof body;
    } catch {
      return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
    }

    jobText = typeof body.jobText === "string" ? body.jobText.trim() : "";
    jobTitle = typeof body.jobTitle === "string" ? body.jobTitle.trim() : "";
    jobCompany =
      typeof body.jobCompany === "string" ? body.jobCompany.trim() : "";
    resumes = parseResumes(body.resumes);
  }

  if (jobText.length < 60) {
    return NextResponse.json(
      { error: "Paste the job description you want to compare against." },
      { status: 400 },
    );
  }

  if (resumes.length < 2) {
    return NextResponse.json(
      { error: "Add at least two readable resume files (PDF or DOCX)." },
      { status: 400 },
    );
  }

  if (resumes.length > 4) {
    return NextResponse.json(
      { error: "Compare at most four resumes at a time." },
      { status: 400 },
    );
  }

  try {
    const results = await Promise.all(
      resumes.map(async (resume, index) =>
        runAnalysis({
          id: `comparison-entry-${index + 1}`,
          resume: {
            id: `candidate-${index + 1}`,
            title: resume.title,
            fileName: resume.fileName,
            text: resume.text,
          },
          job: {
            text: jobText,
            title: jobTitle || null,
            company: jobCompany || null,
          },
          includeFeedback: false,
        }),
      ),
    );

    const entries: ComparisonEntry[] = results.map((output, index) => ({
      resumeId: `candidate-${index + 1}`,
      resumeTitle: resumes[index].title,
      overallScore: output.result.overallScore,
      scores: output.result.scores as SubScores,
      matchedCount: output.result.skills.matched.length,
      missingCount: output.result.skills.missing.length,
      atsScore: output.result.ats.filter((check) => check.status === "pass").length,
    }));

    const best = [...entries].sort((a, b) => b.overallScore - a.overallScore)[0];

    const generation = await generateComparisonVerdict({
      jobTitle: results[0].result.job.title,
      company: results[0].result.job.company,
      entries: results.map((output, index) => ({
        title: resumes[index].title,
        overallScore: output.result.overallScore,
        scores: output.result.scores,
        matchedCount: output.result.skills.matched.length,
        missingCount: output.result.skills.missing.length,
        matched: output.result.skills.matched.map((skill) => skill.name),
        missing: output.result.skills.missing.map((skill) => skill.name),
      })),
    });

    const comparison: ComparisonResult = {
      id:
        viewer.type === "demo"
          ? `local-comparison-${crypto.randomUUID()}`
          : crypto.randomUUID(),
      jobTitle: results[0].result.job.title,
      company: results[0].result.job.company,
      entries,
      bestResumeId: best?.resumeId ?? entries[0]?.resumeId ?? "",
      verdict: generation.verdict,
      createdAt: new Date().toISOString(),
    };

    if (viewer.type === "user") {
      const supabase = await createClient();
      const { error } = await supabase.from("comparisons").insert({
        id: comparison.id,
        user_id: viewer.user.id,
        job_title: comparison.jobTitle,
        company: comparison.company,
        result: comparison,
      });

      if (error) {
        console.error("Comparison save failed:", error.message);
      }
    }

    return NextResponse.json({
      comparison,
      local: viewer.type === "demo",
      model: generation.model,
      fallback: generation.fallback,
    });
  } catch (error) {
    console.error("Comparison failed:", error);
    return NextResponse.json(
      { error: "The comparison failed. Check the files and try again." },
      { status: 500 },
    );
  }
}
