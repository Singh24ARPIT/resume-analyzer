import { NextResponse } from "next/server";
import { extractResumeText, ResumeParseError } from "@/lib/parsing/resume";
import { runAnalysis } from "@/lib/analysis/run";

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
  const jobText = field(formData, "jobText");
  const jobTitle = field(formData, "jobTitle");
  const jobCompany = field(formData, "jobCompany");
  const jobSourceUrl = field(formData, "jobSourceUrl");

  if (!file) {
    return NextResponse.json(
      { error: "Choose a PDF or DOCX resume to analyze." },
      { status: 400 },
    );
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

  try {
    const parsed = await extractResumeText(file);

    const output = await runAnalysis({
      id: crypto.randomUUID(),
      resume: {
        title: titleFromFileName(parsed.fileName),
        fileName: parsed.fileName,
        text: parsed.text,
        fileType: parsed.fileType,
      },
      job: {
        text: jobText,
        title: jobTitle || null,
        company: jobCompany || null,
        sourceUrl: jobSourceUrl || null,
      },
    });

    return NextResponse.json(
      { result: output.result },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (error) {
    if (error instanceof ResumeParseError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error(
      "Analysis failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return NextResponse.json(
      { error: "The analysis failed unexpectedly. Try again." },
      { status: 500 },
    );
  }
}
