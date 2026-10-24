import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { extractResumeText, ResumeParseError } from "@/lib/parsing/resume";
import { runAnalysis, computeSemanticScore } from "@/lib/analysis/run";
import { detectSkillNames } from "@/lib/scoring/taxonomy";
import type { ParsedJob } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 60;

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function titleFromFileName(fileName: string) {
  const base =
    fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "Resume";

  return base.charAt(0).toUpperCase() + base.slice(1);
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json(
      { error: "Sign in to run an analysis." },
      { status: 401 },
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "That upload could not be read. Try again." },
      { status: 400 },
    );
  }

  const fileEntry = formData.get("file");
  const file = fileEntry instanceof File && fileEntry.size > 0 ? fileEntry : null;
  const resumeId = field(formData, "resumeId");
  const resumeTextInput = field(formData, "resumeText");
  const resumeFileNameInput = field(formData, "resumeFileName");
  const jobId = field(formData, "jobId");
  const resumeTitleInput = field(formData, "resumeTitle");
  const jobTextInput = field(formData, "jobText");
  const jobTitleInput = field(formData, "jobTitle");
  const jobCompanyInput = field(formData, "jobCompany");
  const jobSourceUrlInput = field(formData, "jobSourceUrl");

  const isUser = viewer.type === "user";
  const user = viewer.type === "user" ? viewer.user : null;

  try {
    let resumeText = "";
    let fileName = "resume.pdf";
    let fileType: string | null = null;
    let existingResumeTitle = "";

    if (file) {
      const parsed = await extractResumeText(file);
      resumeText = parsed.text;
      fileName = parsed.fileName;
      fileType = parsed.fileType;
    } else if (resumeId && isUser) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("resumes")
        .select("id, title, file_name, file_type, content_text")
        .eq("id", resumeId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json(
          { error: "That saved resume could not be found." },
          { status: 404 },
        );
      }

      existingResumeTitle = data.title ?? "Resume";
      fileName = data.file_name ?? "resume.pdf";
      fileType = data.file_type ?? null;
      resumeText = (data.content_text as string | null) ?? "";

      if (!resumeText) {
        return NextResponse.json(
          {
            error:
              "This resume was saved before text extraction was enabled. Re-upload it once, then try again.",
          },
          { status: 409 },
        );
      }
    } else if (viewer.type === "demo" && resumeTextInput.length >= 80) {
      resumeText = resumeTextInput;
      fileName = resumeFileNameInput || "resume.pdf";
      fileType = fileName.toLowerCase().endsWith(".docx") ? "docx" : "pdf";
    } else {
      return NextResponse.json(
        { error: "Upload a resume file or choose a saved resume." },
        { status: 400 },
      );
    }

    let jobText = jobTextInput;
    let jobTitle = jobTitleInput || null;
    let jobCompany = jobCompanyInput || null;
    let jobSourceUrl = jobSourceUrlInput || null;
    let existingJob: { title: string | null; company: string | null; raw_text: string | null; source_url: string | null } | null = null;

    if (!jobText && jobId && isUser) {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("job_descriptions")
        .select("title, company, raw_text, source_url")
        .eq("id", jobId)
        .eq("user_id", user!.id)
        .maybeSingle();

      if (error || !data) {
        return NextResponse.json(
          { error: "That saved job description could not be found." },
          { status: 404 },
        );
      }

      existingJob = data;
      jobText = data.raw_text ?? "";
      jobTitle = data.title ?? jobTitle;
      jobCompany = data.company ?? jobCompany;
      jobSourceUrl = data.source_url ?? jobSourceUrl;
    }

    if (jobText.length < 60) {
      return NextResponse.json(
        {
          error:
            "Paste a job description first. It should include the responsibilities or requirements.",
        },
        { status: 400 },
      );
    }

    const resumeTitle =
      resumeTitleInput || existingResumeTitle || titleFromFileName(fileName);

    const analysisId = isUser
      ? crypto.randomUUID()
      : `local-${crypto.randomUUID()}`;

    const newResumeId = isUser && !resumeId ? crypto.randomUUID() : resumeId;
    const newJobId = isUser && !jobId ? crypto.randomUUID() : jobId;

    let semanticScore: number | undefined;
    if (isUser) {
      semanticScore = await computeSemanticScore(resumeText, jobText);
    }

    const output = await runAnalysis({
      id: analysisId,
      resume: {
        id: newResumeId || undefined,
        title: resumeTitle,
        fileName,
        text: resumeText,
        fileType,
      },
      job: {
        id: newJobId || undefined,
        text: jobText,
        title: jobTitle,
        company: jobCompany,
        sourceUrl: jobSourceUrl,
      },
      semanticScore,
    });

    if (!isUser || !user) {
      return NextResponse.json({ result: output.result, local: true });
    }

    const supabase = await createClient();
    const ext = fileName.split(".").pop()?.toLowerCase() === "docx" ? "docx" : "pdf";
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

    if (file) {
      const filePath = `${user.id}/${newResumeId}.${ext}`;
      const buffer = await file.arrayBuffer();

      const upload = await supabase.storage
        .from("resumes")
        .upload(filePath, buffer, { contentType, upsert: false });

      if (upload.error) {
        console.error("Resume upload failed:", upload.error.message);
        return NextResponse.json(
          {
            error:
              "The resume was analyzed but could not be stored. Check that the private 'resumes' bucket exists.",
          },
          { status: 500 },
        );
      }

      const { error: resumeError } = await supabase.from("resumes").insert({
        id: newResumeId,
        user_id: user.id,
        title: resumeTitle,
        file_name: fileName,
        file_path: filePath,
        file_type: contentType,
        file_size: file.size,
        word_count: output.metrics.wordCount,
        skills: detectSkillNames(resumeText),
        content_text: resumeText,
        metrics: output.metrics,
      });

      if (resumeError) {
        console.error("Resume row insert failed:", resumeError.message);
        return NextResponse.json(
          { error: "The resume file was stored but its record could not be saved." },
          { status: 500 },
        );
      }
    }

    if (!existingJob) {
      const { error: jobError } = await supabase.from("job_descriptions").insert({
        id: newJobId,
        user_id: user.id,
        title: output.parsedJob.title,
        company: output.parsedJob.company,
        source_url: output.parsedJob.sourceUrl ?? jobSourceUrl,
        raw_text: jobText,
        must_have_skills: output.parsedJob.mustHaveSkills,
        parsed: output.parsedJob satisfies ParsedJob,
      });

      if (jobError) {
        console.error("Job insert failed:", jobError.message);
        return NextResponse.json(
          { error: "The analysis ran but the job description could not be saved." },
          { status: 500 },
        );
      }
    }

    const { error: analysisError } = await supabase.from("analyses").insert({
      id: analysisId,
      user_id: user.id,
      resume_id: newResumeId || null,
      job_id: newJobId || null,
      overall_score: output.result.overallScore,
      scores: output.result.scores,
      model: output.result.model,
      ai_fallback: output.result.aiFallback ?? false,
      result: output.result,
    });

    if (analysisError) {
      console.error("Analysis insert failed:", analysisError.message);
      return NextResponse.json(
        { error: "The analysis ran but the report could not be saved." },
        { status: 500 },
      );
    }

    return NextResponse.json({ result: output.result, local: false });
  } catch (error) {
    if (error instanceof ResumeParseError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Analysis failed:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "The analysis failed unexpectedly. Try again.",
      },
      { status: 500 },
    );
  }
}
