"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  DEMO_COOKIE,
  DEMO_COOKIE_MAX_AGE,
  isSupabaseConfigured,
} from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export type AuthState = { error?: string; message?: string } | null;

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const signUpSchema = credentialsSchema.extend({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "That name is a little too long."),
});

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "/dashboard";
  if (!next.startsWith("/") || next.startsWith("//")) return "/dashboard";
  return next;
}

async function getOrigin() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;

  const headerStore = await headers();
  const host = headerStore.get("host") ?? "localhost:3000";
  const proto =
    headerStore.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function signInAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase isn't configured yet. Add your project keys to .env.local, or explore the demo workspace.",
    };
  }

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      error:
        error.message === "Invalid login credentials"
          ? "That email and password combination doesn't match an account."
          : error.message,
    };
  }

  redirect(safeNext(formData.get("next")));
}

export async function signUpAction(
  _previousState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) {
    return {
      error:
        "Supabase isn't configured yet. Add your project keys to .env.local, or explore the demo workspace.",
    };
  }

  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Check your details." };
  }

  const origin = await getOrigin();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
      emailRedirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return {
      error:
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
          ? "An account with this email already exists. Try signing in."
          : error.message,
    };
  }

  if (data.session) {
    redirect(safeNext(formData.get("next")));
  }

  return {
    message:
      "Your account is ready. Check your inbox for a confirmation link, then sign in.",
  };
}

export async function enterDemoAction() {
  const cookieStore = await cookies();
  cookieStore.set(DEMO_COOKIE, "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEMO_COOKIE_MAX_AGE,
  });

  redirect("/dashboard");
}

export async function signOutAction() {
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  const cookieStore = await cookies();
  cookieStore.delete(DEMO_COOKIE);
  redirect("/");
}
