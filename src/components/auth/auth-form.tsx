"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import {
  enterDemoAction,
  signInAction,
  signUpAction,
  type AuthState,
} from "@/app/(auth)/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({
  mode,
  configured,
  next = "/dashboard",
  queryError,
}: {
  mode: "login" | "signup";
  configured: boolean;
  next?: string;
  queryError?: string;
}) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    action,
    null,
  );
  const [showPassword, setShowPassword] = useState(false);

  const isSignup = mode === "signup";

  if (!configured) {
    return (
      <div className="animate-rise">
        <div className="mb-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
            Demo workspace
          </p>
          <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.035em]">
            Try Rolefit before wiring up accounts.
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            The demo runs entirely in your browser with sample data and a mock
            scoring engine. No sign-up, no API keys, no resume storage.
          </p>
        </div>

        <form action={enterDemoAction}>
          <Button type="submit" variant="accent" size="lg" className="w-full">
            Explore the demo workspace
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="mt-7 rounded-2xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ShieldCheck className="size-4 text-success" />
            Connect Supabase for a real workspace
          </div>
          <ol className="mt-3 space-y-2 text-[13px] leading-5 text-muted">
            <li className="flex gap-2">
              <span className="font-mono text-[11px] text-muted-strong">01</span>
              Create a free project at supabase.com.
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-[11px] text-muted-strong">02</span>
              Copy the project URL and publishable key into{" "}
              <code className="rounded bg-surface-2 px-1 font-mono text-[11px]">
                .env.local
              </code>
              .
            </li>
            <li className="flex gap-2">
              <span className="font-mono text-[11px] text-muted-strong">03</span>
              Run the SQL migration and restart the dev server.
            </li>
          </ol>
          <p className="mt-3 text-[12px] leading-5 text-muted">
            Full setup steps live in{" "}
            <span className="font-medium text-muted-strong">README.md</span>.
            Once configured, this page becomes email/password sign-in.
          </p>
        </div>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-muted">
          <Sparkles className="size-3.5" />
          No credentials are required for the demo.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-rise">
      <div className="mb-7">
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">
          {isSignup ? "Create your workspace" : "Welcome back"}
        </p>
        <h1 className="mt-2 text-[30px] font-semibold leading-tight tracking-[-0.035em]">
          {isSignup ? "Start matching smarter." : "Sign in to Rolefit."}
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          {isSignup
            ? "Save resumes, analyze against real job descriptions, and track your best fits."
            : "Pick up where you left off — your analyses are waiting."}
        </p>
      </div>

      {queryError ? (
        <Alert tone="error" className="mb-4">
          {queryError}
        </Alert>
      ) : null}

      {state?.error ? (
        <Alert tone="error" className="mb-4">
          {state.error}
        </Alert>
      ) : null}

      {state?.message ? (
        <Alert tone="success" className="mb-4">
          {state.message}
        </Alert>
      ) : null}

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />

        {isSignup ? (
          <div className="space-y-1.5">
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              name="fullName"
              placeholder="Arpit Singh"
              autoComplete="name"
              required
            />
          </div>
        ) : null}

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={isSignup ? "At least 8 characters" : "Your password"}
              autoComplete={isSignup ? "new-password" : "current-password"}
              minLength={8}
              required
              className="pr-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {isSignup ? (
            <p className="text-[11px] text-muted">
              Use 8+ characters. You can add Google sign-in later.
            </p>
          ) : null}
        </div>

        <Button
          type="submit"
          variant="accent"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              {isSignup ? "Creating account…" : "Signing in…"}
            </>
          ) : (
            <>
              {isSignup ? "Create account" : "Sign in"}
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      {isSignup ? (
        <p className="mt-4 text-center text-[11px] leading-5 text-muted">
          By creating an account you agree to keep uploaded content to your own
          resumes. Rolefit stores files privately in your workspace.
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-muted">
        {isSignup ? "Already have an account?" : "New to Rolefit?"}{" "}
        <Link
          href={isSignup ? "/login" : "/signup"}
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
