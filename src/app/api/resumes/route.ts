import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { extractResumeText, ResumeParseError } from "@/lib/parsing/resume";
import { buildResumeMetrics, parseSections } from "@/lib/parsing/sections";
import { detectSkillNames } from "@/lib/scoring/taxonomy";
import type { ResumeRecord } from "@/lib/types";

export const runtime = "nodejs";

function field(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function titleFromFileName(fileName: string) {
  return (
    fileName
      .replace(/\.[^.]+$/, "")
      .replace(/[_-]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120) || "Resume"
  );
}

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in to save a resume." }, { status: 401 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "That upload could not be read." }, { status: 400 });
  }

  const entry = formData.get("file");
  const file = entry instanceof File && entry.size > 0 ? entry : null;

  if (!file) {
    return NextResponse.json({ error: "Choose a PDF or DOCX file." }, { status: 400 });
  }

  try {
    const parsed = await extractResumeText(file);
    const sections = parseSections(parsed.text).sections;
    const metrics = buildResumeMetrics(parsed.text, sections);
    const skills = detectSkillNames(parsed.text);
    const title = field(formData, "title") || titleFromFileName(parsed.fileName);
    const createdAt = new Date().toISOString();

    if (viewer.type === "demo") {
      const resume: ResumeRecord = {
        id: `local-resume-${crypto.randomUUID()}`,
        title,
        fileName: parsed.fileName,
        filePath: "local",
        fileType: parsed.fileType,
        fileSize: parsed.fileSize,
        wordCount: metrics.wordCount,
        skills,
        createdAt,
      };

      return NextResponse.json({ resume, text: parsed.text, local: true });
    }

    const supabase = await createClient();
    const user = viewer.user;
    const resumeId = crypto.randomUUID();
    const ext = parsed.fileType === "docx" ? "docx" : "pdf";
    const contentType =
      ext === "pdf"
        ? "application/pdf"
        : "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    const filePath = `${user.id}/${resumeId}.${ext}`;

    const upload = await supabase.storage
      .from("resumes")
      .upload(filePath, await file.arrayBuffer(), { contentType, upsert: false });

    if (upload.error) {
      console.error("Resume upload failed:", upload.error.message);
      return NextResponse.json(
        {
          error:
            "The file could not be stored. Check that the private 'resumes' bucket exists and the migration has been applied.",
        },
        { status: 500 },
      );
    }

    const { error } = await supabase.from("resumes").insert({
      id: resumeId,
      user_id: user.id,
      title,
      file_name: parsed.fileName,
      file_path: filePath,
      file_type: contentType,
      file_size: parsed.fileSize,
      word_count: metrics.wordCount,
      skills,
      content_text: parsed.text,
      metrics,
    });

    if (error) {
      console.error("Resume insert failed:", error.message);
      await supabase.storage.from("resumes").remove([filePath]);
      return NextResponse.json(
        { error: "The resume record could not be saved." },
        { status: 500 },
      );
    }

    const resume: ResumeRecord = {
      id: resumeId,
      title,
      fileName: parsed.fileName,
      filePath,
      fileType: contentType,
      fileSize: parsed.fileSize,
      wordCount: metrics.wordCount,
      skills,
      createdAt,
    };

    return NextResponse.json({ resume, local: false });
  } catch (error) {
    if (error instanceof ResumeParseError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Resume save failed:", error);
    return NextResponse.json(
      { error: "That resume could not be saved. Try another file." },
      { status: 500 },
    );
  }
}
