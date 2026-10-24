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
  const user = viewer.user;

  const { data } = await supabase
    .from("resumes")
    .select("file_path")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (data?.file_path) {
    const removal = await supabase.storage.from("resumes").remove([data.file_path]);
    if (removal.error) {
      console.error("Resume file removal failed:", removal.error.message);
    }
  }

  const { error } = await supabase
    .from("resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    console.error("Resume delete failed:", error.message);
    return NextResponse.json(
      { error: "That resume could not be deleted." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
