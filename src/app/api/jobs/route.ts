import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { inferJobFromText } from "@/lib/parsing/jd-heuristics";
import type { JobRecord } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in to save a job." }, { status: 401 });
  }

  let body: {
    text?: unknown;
    title?: unknown;
    company?: unknown;
    sourceUrl?: unknown;
  };

  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "Send a JSON body." }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const company = typeof body.company === "string" ? body.company.trim() : "";
  const sourceUrl = typeof body.sourceUrl === "string" ? body.sourceUrl.trim() : "";

  if (text.length < 60) {
    return NextResponse.json(
      { error: "Paste a fuller job description first." },
      { status: 400 },
    );
  }

  const parsed = inferJobFromText({
    text,
    title: title || null,
    company: company || null,
    sourceUrl: sourceUrl || null,
  });

  const createdAt = new Date().toISOString();
  const id =
    viewer.type === "demo" ? `local-job-${crypto.randomUUID()}` : crypto.randomUUID();

  const job: JobRecord = {
    id,
    title: parsed.title,
    company: parsed.company,
    sourceUrl: parsed.sourceUrl ?? null,
    mustHaveSkills: parsed.mustHaveSkills,
    createdAt,
  };

  if (viewer.type === "demo") {
    return NextResponse.json({ job, local: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("job_descriptions").insert({
    id,
    user_id: viewer.user.id,
    title: parsed.title,
    company: parsed.company,
    source_url: parsed.sourceUrl ?? null,
    raw_text: text,
    must_have_skills: parsed.mustHaveSkills,
    parsed,
  });

  if (error) {
    console.error("Job save failed:", error.message);
    return NextResponse.json(
      { error: "That job description could not be saved." },
      { status: 500 },
    );
  }

  return NextResponse.json({ job, local: false });
}
