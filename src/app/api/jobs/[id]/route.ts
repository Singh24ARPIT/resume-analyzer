import { NextResponse } from "next/server";
import { getViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const viewer = await getViewer();
  if (!viewer) {
    return NextResponse.json({ error: "Sign in first." }, { status: 401 });
  }

  const { id } = await params;

  if (viewer.type === "demo") {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("job_descriptions")
    .delete()
    .eq("id", id)
    .eq("user_id", viewer.user.id);

  if (error) {
    console.error("Job delete failed:", error.message);
    return NextResponse.json(
      { error: "That job description could not be deleted." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
