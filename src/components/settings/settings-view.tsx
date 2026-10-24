"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BrainCircuit,
  Check,
  Database,
  HardDrive,
  Loader2,
  LogOut,
  Save,
  Scale,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import {
  deleteWorkspaceDataAction,
  updateProfileAction,
  type SettingsState,
} from "@/app/(app)/settings/actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  clearLocalWorkspace,
  countLocalWorkspace,
} from "@/lib/demo/local";
import type { WorkspaceCounts } from "@/lib/data/library";

const WEIGHTS = [
  { label: "Must-have skills", value: 35 },
  { label: "Experience", value: 20 },
  { label: "Semantic fit", value: 15 },
  { label: "Preferred skills", value: 10 },
  { label: "ATS readiness", value: 10 },
  { label: "Impact and clarity", value: 10 },
];

type LocalCounts = ReturnType<typeof countLocalWorkspace>;

export function SettingsView({
  viewer,
  counts,
  aiConfigured,
  aiModel,
}: {
  viewer: { type: "user" | "demo"; name: string; email: string; userId?: string };
  counts: WorkspaceCounts;
  aiConfigured: boolean;
  aiModel: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<SettingsState, FormData>(
    updateProfileAction,
    null,
  );
  const [localCounts, setLocalCounts] = useState<LocalCounts | null>(null);
  const [clearing, setClearing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [localNote, setLocalNote] = useState("");
  const [deleteNote, setDeleteNote] = useState<SettingsState>(null);

  useEffect(() => {
    setLocalCounts(countLocalWorkspace());
  }, []);

  function handleClearBrowserData() {
    if (
      !window.confirm(
        "Clear every demo analysis, resume, job description, and cover letter stored in this browser? This cannot be undone.",
      )
    ) {
      return;
    }

    setClearing(true);
    clearLocalWorkspace();
    setLocalCounts(countLocalWorkspace());
    setLocalNote("Browser demo data cleared.");
    setClearing(false);
    router.refresh();
  }

  async function handleDeleteWorkspace() {
    if (
      !window.confirm(
        "Delete every resume, analysis, comparison, job description, and cover letter in your workspace? Your account stays active. This cannot be undone.",
      )
    ) {
      return;
    }

    setDeleting(true);
    setDeleteNote(null);

    try {
      const result = await deleteWorkspaceDataAction();
      setDeleteNote(result);
      if (result?.message) router.refresh();
    } catch {
      setDeleteNote({
        error: "Workspace data could not be deleted. Try again in a moment.",
      });
    } finally {
      setDeleting(false);
    }
  }

  const workspaceTotal =
    counts.analyses + counts.resumes + counts.jobs + counts.letters;
  const localTotal = localCounts
    ? localCounts.analyses +
      localCounts.resumes +
      localCounts.jobs +
      localCounts.letters
    : 0;

  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                <UserRound className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  Profile
                </p>
                <h2 className="text-[15px] font-semibold">Your account</h2>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-5">
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
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="fullName">Display name</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={viewer.name}
                    autoComplete="name"
                    minLength={2}
                    maxLength={80}
                    disabled={viewer.type === "demo"}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={viewer.email}
                    readOnly
                    disabled
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="max-w-sm text-[10px] leading-5 text-muted">
                  {viewer.type === "demo"
                    ? "Demo profiles are sample data. Connect Supabase to manage a real account."
                    : "Your name appears on generated cover letters and in the workspace header."}
                </p>
                <Button
                  type="submit"
                  variant="accent"
                  size="sm"
                  disabled={pending || viewer.type === "demo"}
                  className="shrink-0"
                >
                  {pending ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save className="size-3.5" />
                      Save profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                <Database className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  Workspace
                </p>
                <h2 className="text-[15px] font-semibold">Data and storage</h2>
              </div>
            </div>
          </CardHeader>

          <CardContent className="pt-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={viewer.type === "demo" ? "warning" : "success"}>
                {viewer.type === "demo" ? "Demo mode" : "Private account"}
              </Badge>
              <span className="font-mono text-[10px] text-muted">
                {viewer.type === "demo"
                  ? "Browser storage"
                  : `User ${viewer.userId?.slice(0, 8) ?? "account"}`}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Analyses", value: counts.analyses },
                { label: "Resumes", value: counts.resumes },
                { label: "Jobs", value: counts.jobs },
                { label: "Letters", value: counts.letters },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-border bg-surface-2 px-3 py-2.5"
                >
                  <p className="font-mono text-[18px] font-semibold leading-none">
                    {item.value}
                  </p>
                  <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-muted">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-3 text-[10px] leading-5 text-muted">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-success" />
              <span>
                {viewer.type === "demo"
                  ? "Nothing in demo mode is uploaded. Analyses, parsed resume text, and cover letters are saved in this browser's local storage."
                  : "Resume files live in a private Supabase Storage bucket. Database rows are protected by row-level security and scoped to your user ID."}
              </span>
            </div>

            <p className="mt-3 text-[10px] text-muted">
              {workspaceTotal} workspace {workspaceTotal === 1 ? "record" : "records"}
              {viewer.type === "demo"
                ? " · sample fixtures, not personal data"
                : " · stored in Supabase"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-danger/25">
          <CardHeader className="border-b border-danger/15 bg-danger-soft/40">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-danger/20 bg-danger-soft text-danger">
                <AlertTriangle className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-danger">
                  Danger zone
                </p>
                <h2 className="text-[15px] font-semibold">Delete workspace data</h2>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 pt-5">
            {deleteNote?.error ? (
              <Alert tone="error">{deleteNote.error}</Alert>
            ) : null}
            {deleteNote?.message ? (
              <Alert tone="success">{deleteNote.message}</Alert>
            ) : null}
            {localNote ? <Alert tone="success">{localNote}</Alert> : null}

            {viewer.type === "demo" ? (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-medium">Browser demo data</p>
                    <p className="mt-0.5 text-[10px] leading-5 text-muted">
                      {localCounts
                        ? `${localTotal} local ${localTotal === 1 ? "record" : "records"}: ${localCounts.analyses} analyses, ${localCounts.resumes} resumes, ${localCounts.jobs} jobs, ${localCounts.letters} letters.`
                        : "Counting local records…"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleClearBrowserData}
                    disabled={clearing}
                    className="shrink-0 text-danger hover:border-danger/30 hover:bg-danger-soft"
                  >
                    {clearing ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Clear browser data
                  </Button>
                </div>
                <p className="text-[10px] leading-5 text-muted">
                  Sample fixtures are part of the app and stay available. This
                  only removes analyses, resumes, jobs, and cover letters you
                  created in this browser.
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[12px] font-medium">All cloud records</p>
                    <p className="mt-0.5 text-[10px] leading-5 text-muted">
                      Deletes {workspaceTotal} database{" "}
                      {workspaceTotal === 1 ? "record" : "records"} plus every
                      file in your private resume bucket. Your login is kept.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleDeleteWorkspace}
                    disabled={deleting}
                    className="shrink-0 text-danger hover:border-danger/30 hover:bg-danger-soft"
                  >
                    {deleting ? (
                      <Loader2 className="size-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="size-3.5" />
                    )}
                    Delete all data
                  </Button>
                </div>
                <p className="text-[10px] leading-5 text-muted">
                  This cannot be undone. Export any report you want to keep
                  before continuing.
                </p>
              </>
            )}

            <div className="flex items-center justify-between border-t border-border pt-4">
              <p className="text-[10px] text-muted">
                {viewer.type === "demo"
                  ? "Leave the demo and return to the landing page."
                  : "End this session on this device."}
              </p>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  <LogOut className="size-3.5" />
                  {viewer.type === "demo" ? "Exit demo" : "Sign out"}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                <Scale className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  Scoring
                </p>
                <h2 className="text-[15px] font-semibold">How the score works</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="space-y-3">
              {WEIGHTS.map((weight) => (
                <div key={weight.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[11px] text-muted-strong">
                      {weight.label}
                    </span>
                    <span className="font-mono text-[10px] text-muted">
                      {weight.value}%
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full bg-accent"
                      style={{ width: `${weight.value * 2.6}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-border pt-3 text-[10px] leading-5 text-muted">
              The weights add up to 100. The same resume and job pair always
              produces the same deterministic score. AI never changes the
              number.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                <BrainCircuit className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  AI engine
                </p>
                <h2 className="text-[15px] font-semibold">Feedback generation</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-strong">Mode</span>
              <Badge variant={aiConfigured ? "success" : "outline"}>
                {aiConfigured ? (
                  <>
                    <Sparkles className="size-3" />
                    Gemini
                  </>
                ) : (
                  <>
                    <Check className="size-3" />
                    Local engine
                  </>
                )}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-strong">Model</span>
              <span className="font-mono text-[10px] text-muted">{aiModel}</span>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="text-[11px] text-muted-strong">Embeddings</span>
              <span className="font-mono text-[10px] text-muted">
                {aiConfigured ? "gemini-embedding-001" : "lexical cosine"}
              </span>
            </div>
            <p className="mt-4 border-t border-border pt-3 text-[10px] leading-5 text-muted">
              {aiConfigured
                ? "Gemini writes feedback, cover letters, and comparison verdicts from redacted text. Scores and skill matching stay deterministic."
                : "No Gemini key is configured, so grounded local templates write the feedback. Add GEMINI_API_KEY to enable the hosted model."}
            </p>
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3">
          <HardDrive className="mt-0.5 size-3.5 shrink-0 text-muted" />
          <p className="text-[10px] leading-5 text-muted">
            Deleting an analysis removes the report, not the source resume or job
            description. Delete those separately from their libraries.
          </p>
        </div>
      </div>
    </div>
  );
}
