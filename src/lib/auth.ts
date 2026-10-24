import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { DEMO_COOKIE, isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";

export const DEMO_USER = {
  id: "demo-user",
  email: "demo@rolefit.local",
  name: "Demo User",
};

export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!isSupabaseConfigured) return null;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
});

export async function isDemoSession() {
  if (isSupabaseConfigured) return false;
  const cookieStore = await cookies();
  return cookieStore.get(DEMO_COOKIE)?.value === "1";
}

export type Viewer =
  | { type: "user"; user: User; name: string; email: string }
  | { type: "demo"; user: null; name: string; email: string };

export async function getViewer(): Promise<Viewer | null> {
  const user = await getCurrentUser();

  if (user) {
    const name =
      (user.user_metadata?.full_name as string | undefined) ||
      user.email?.split("@")[0] ||
      "Account";
    return { type: "user", user, name, email: user.email ?? "" };
  }

  if (await isDemoSession()) {
    return {
      type: "demo",
      user: null,
      name: DEMO_USER.name,
      email: DEMO_USER.email,
    };
  }

  return null;
}

export async function requireViewer() {
  const viewer = await getViewer();
  if (!viewer) redirect("/login");
  return viewer;
}
