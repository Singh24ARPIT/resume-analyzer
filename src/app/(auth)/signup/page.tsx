import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Create account",
  description: "Create a private Resume Analyzer workspace.",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams;
  const next =
    typeof params.next === "string" && params.next.startsWith("/")
      ? params.next
      : "/dashboard";

  return (
    <AuthForm
      mode="signup"
      configured={isSupabaseConfigured}
      next={next}
      queryError={typeof params.error === "string" ? params.error : undefined}
    />
  );
}
