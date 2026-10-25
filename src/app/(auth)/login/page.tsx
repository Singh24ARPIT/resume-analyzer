import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Resume Analyzer workspace.",
};

type Props = {
  searchParams: Promise<{
    next?: string;
    setup?: string;
    error?: string;
  }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/dashboard";

  return (
    <AuthForm
      mode="login"
      configured={isSupabaseConfigured}
      next={next}
      queryError={
        params.error === "supabase"
          ? "Supabase isn't connected yet. Use the demo below or finish setup first."
          : typeof params.error === "string"
            ? params.error
            : undefined
      }
    />
  );
}
