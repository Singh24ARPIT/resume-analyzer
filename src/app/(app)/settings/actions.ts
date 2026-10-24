"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getViewer } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error?: string; message?: string } | null;

const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "That name is a little too long."),
});

export async function updateProfileAction(
  _previousState: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: "Your session expired. Sign in again." };
  }

  if (viewer.type !== "user" || !isSupabaseConfigured) {
    return {
      error:
        "This is the demo workspace. Profile editing is available once Supabase is connected.",
    };
  }

  const parsed = profileSchema.safeParse({
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your name." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    data: { full_name: parsed.data.fullName },
  });

  if (error) {
    console.error("Profile update failed:", error.message);
    return { error: "Your profile could not be updated. Try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout");

  return { message: "Profile updated." };
}

export async function deleteWorkspaceDataAction(): Promise<SettingsState> {
  const viewer = await getViewer();
  if (!viewer) {
    return { error: "Your session expired. Sign in again." };
  }

  if (viewer.type !== "user") {
    return {
      error:
        "Demo data lives in this browser. Use the browser-data control below to clear it.",
    };
  }

  const supabase = await createClient();
  const userId = viewer.user.id;

  try {
    const { data: files, error: listError } = await supabase.storage
      .from("resumes")
      .list(userId, { limit: 1000 });

    if (listError) {
      console.error("Resume file listing failed:", listError.message);
    } else if (files?.length) {
      const paths = files
        .filter((file) => file.name && !file.id?.endsWith("/"))
        .map((file) => `${userId}/${file.name}`);

      if (paths.length) {
        const { error: removeError } = await supabase.storage
          .from("resumes")
          .remove(paths);

        if (removeError) {
          console.error("Resume file removal failed:", removeError.message);
        }
      }
    }

    const deletions: Array<[string, string]> = [
      ["cover_letters", "Cover letters"],
      ["analyses", "Analyses"],
      ["comparisons", "Comparisons"],
      ["job_descriptions", "Job descriptions"],
      ["resumes", "Resumes"],
    ];

    for (const [table, label] of deletions) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq("user_id", userId);

      if (error) {
        console.error(`${label} deletion failed:`, error.message);
        return {
          error: `${label} could not be deleted. Nothing else was changed after that step.`,
        };
      }
    }

    for (const path of [
      "/dashboard",
      "/history",
      "/resumes",
      "/jobs",
      "/cover-letters",
      "/settings",
    ]) {
      revalidatePath(path);
    }

    return {
      message:
        "Workspace data deleted. Your account and sign-in details were kept.",
    };
  } catch (error) {
    console.error("Workspace deletion failed:", error);
    return {
      error: "Workspace data could not be deleted. Try again in a moment.",
    };
  }
}
