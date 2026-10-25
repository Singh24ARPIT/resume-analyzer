import { NextResponse } from "next/server";
import { fetchJobFromUrl, JobImportError } from "@/lib/parsing/job";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let url = "";
  try {
    const body = (await request.json()) as { url?: unknown };
    url = typeof body.url === "string" ? body.url.trim() : "";
  } catch {
    return NextResponse.json(
      { error: "Send a JSON body with a url field." },
      { status: 400 },
    );
  }

  if (!url) {
    return NextResponse.json({ error: "Paste a job posting URL." }, { status: 400 });
  }

  try {
    const job = await fetchJobFromUrl(url);
    return NextResponse.json(job);
  } catch (error) {
    if (error instanceof JobImportError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Job import failed:", error);
    return NextResponse.json(
      { error: "That page could not be imported. Paste the description instead." },
      { status: 500 },
    );
  }
}
