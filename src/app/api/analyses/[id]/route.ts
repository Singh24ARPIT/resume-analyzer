import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const viewer = await getViewer();
  if (!viewer || viewer.type !== "user") {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("analyses")
    .select("result")
    .eq("id", id)
    .eq("user_id", viewer.user.id)
    .maybeSingle();

  if (error || !data?.result) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }

  return NextResponse.json(data.result, {
    headers: {
      "content-disposition": `attachment; filename="resume-analyzer-report-${id}.json"`,
    },
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  if (viewer.type === "demo") {
    return NextResponse.json({ ok: true });
  }

  const { id } = await params;
  const supabase = await createClient();
  const { error } = await supabase
    .from("analyses")
    .delete()
    .eq("id", id)
    .eq("user_id", viewer.user.id);

  if (error) {
    console.error("Analysis delete failed:", error.message);
    return NextResponse.json(
      { error: "That analysis could not be deleted." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
