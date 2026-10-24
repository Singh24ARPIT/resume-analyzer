"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  GitCompareArrows,
  Link2,
  Loader2,
  Plus,
  Sparkles,
  Trophy,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/ui/score-ring";
import { Textarea } from "@/components/ui/textarea";
import { humanFileSize } from "@/lib/parsing/validate";
import type { ComparisonResult, ScoreKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const SCORE_LABELS: Array<{ key: ScoreKey; label: string }> = [
  { key: "skills", label: "Must-have skills" },
  { key: "experience", label: "Experience" },
  { key: "semantic", label: "Semantic fit" },
  { key: "preferred", label: "Preferred" },
  { key: "ats", label: "ATS" },
  { key: "impact", label: "Impact" },
];

export function CompareWorkbench() {
  const [jobText, setJobText] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [importing, setImporting] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  function addFiles(incoming: FileList | null) {
    if (!incoming) return;
    setError("");

    const next = [...files];
    for (const file of Array.from(incoming)) {
      if (next.length >= 4) break;
      if (
        !next.some(
          (entry) => entry.name === file.name && entry.size === file.size,
        )
      ) {
        next.push(file);
      }
    }
    setFiles(next);
  }

  async function handleImport() {
    setError("");

    if (!jobUrl.trim()) {
      setError("Paste the job posting URL first.");
      return;
    }

    setImporting(true);

    try {
      const response = await fetch("/api/jobs/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() }),
      });
      const data = (await response.json()) as {
        text?: string;
        title?: string;
        company?: string;
        error?: string;
      };

      if (!response.ok || !data.text) {
        setError(data.error ?? "That page could not be imported.");
        return;
      }

      setJobText(data.text);
      setJobTitle(data.title ?? "");
      setJobCompany(data.company ?? "");
    } catch {
      setError("That page could not be imported. Paste the description instead.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (files.length < 2) {
      setError("Add at least two resume files to compare.");
      return;
    }

    if (jobText.trim().length < 60) {
      setError("Paste the job description you want to compare against.");
      return;
    }

    setPending(true);

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));
      formData.append("jobText", jobText);
      formData.append("jobTitle", jobTitle);
      formData.append("jobCompany", jobCompany);

      const response = await fetch("/api/compare", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        comparison?: ComparisonResult;
        error?: string;
      };

      if (!response.ok || !data.comparison) {
        setError(data.error ?? "The comparison failed. Try again.");
        return;
      }

      setComparison(data.comparison);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("The comparison failed. Try again.");
    } finally {
      setPending(false);
    }
  }

  if (comparison) {
    const sorted = [...comparison.entries].sort(
      (a, b) => b.overallScore - a.overallScore,
    );

    return (
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <div className="relative bg-foreground px-5 py-6 text-background sm:px-7 sm:py-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-10 -top-16 size-56 rounded-full bg-lime/15 blur-3xl"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.18em] text-background/50">
                  <GitCompareArrows className="size-3 text-lime" />
                  Comparison result
                </p>
                <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.04em] sm:text-[28px]">
                  {comparison.jobTitle}
                </h2>
                <p className="mt-1 text-[12px] text-background/55">
                  {comparison.company} · {comparison.entries.length} resume
                  versions
                </p>
              </div>
              <Badge variant="lime" className="shrink-0">
                <Trophy className="size-3" />
                Best fit:{" "}
                {sorted[0]?.resumeTitle ?? "—"}
              </Badge>
            </div>
          </div>

          <CardContent className="p-5 sm:p-6">
            <div className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-accent" />
              <p className="text-[13px] leading-6 text-muted-strong">
                {comparison.verdict}
              </p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => {
                  setComparison(null);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                Compare another set
              </Button>
              <Link
                href="/analyze"
                className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-3.5 py-1.5 text-[11px] font-medium text-white transition-opacity hover:opacity-90"
              >
                Run a full analysis
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-2">
          {sorted.map((entry, index) => {
            const isBest = entry.resumeId === comparison.bestResumeId;

            return (
              <Card
                key={entry.resumeId}
                className={cn(
                  "overflow-hidden",
                  isBest ? "border-success/35" : undefined,
                )}
              >
                <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 font-mono text-[11px] font-semibold">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-semibold">
                        {entry.resumeTitle}
                      </h3>
                      <p className="text-[10px] text-muted">
                        {entry.matchedCount} matched · {entry.missingCount} missing
                      </p>
                    </div>
                  </div>
                  {isBest ? (
                    <Badge variant="success">
                      <Trophy className="size-3" />
                      Best fit
                    </Badge>
                  ) : (
                    <Badge variant="outline">#{index + 1}</Badge>
                  )}
                </CardHeader>

                <CardContent className="pt-5">
                  <div className="flex items-center gap-5">
                    <ScoreRing
                      score={entry.overallScore}
                      size={96}
                      strokeWidth={7}
                      label="Match"
                    />
                    <div className="min-w-0 flex-1 space-y-2.5">
                      {SCORE_LABELS.map(({ key, label }) => (
                        <div key={key}>
                          <div className="flex items-baseline justify-between gap-2">
                            <span className="text-[10px] text-muted">{label}</span>
                            <span className="font-mono text-[10px]">
                              {entry.scores[key]}
                            </span>
                          </div>
                          <Progress
                            value={entry.scores[key]}
                            tone={
                              entry.scores[key] >= 70
                                ? "success"
                                : entry.scores[key] >= 55
                                  ? "accent"
                                  : "warning"
                            }
                            className="mt-1 h-1"
                            label={label}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-[10px]">
                    <span className="flex items-center gap-1.5 text-success">
                      <CheckCircle2 className="size-3" />
                      {entry.matchedCount} requirements met
                    </span>
                    <span className="flex items-center gap-1.5 text-danger">
                      <XCircle className="size-3" />
                      {entry.missingCount} gaps
                    </span>
                    <span className="text-muted">
                      {entry.atsScore} ATS checks
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                <FileText className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  Step 01
                </p>
                <h2 className="text-[15px] font-semibold">
                  Resume versions ({files.length}/4)
                </h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-5 py-8 text-center transition-colors hover:border-accent/40 hover:bg-accent-soft/30">
              <Upload className="size-5 text-muted-strong" />
              <span className="mt-2 text-[12px] font-medium">
                Add 2–4 resume files
              </span>
              <span className="mt-1 text-[10px] text-muted">
                PDF or DOCX, up to 5 MB each
              </span>
              <input
                type="file"
                multiple
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="sr-only"
                onChange={(event) => {
                  addFiles(event.target.files);
                  event.target.value = "";
                }}
              />
            </label>

            {files.length > 0 ? (
              <div className="mt-3 space-y-2">
                {files.map((file) => (
                  <div
                    key={`${file.name}-${file.size}`}
                    className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2"
                  >
                    <FileText className="size-3.5 shrink-0 text-muted" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium">{file.name}</p>
                      <p className="text-[9px] text-muted">
                        {humanFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFiles((current) =>
                          current.filter(
                            (entry) =>
                              !(entry.name === file.name && entry.size === file.size),
                          ),
                        )
                      }
                      className="flex size-6 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-foreground"
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : null}

            {files.length === 1 ? (
              <p className="mt-3 text-[10px] text-warning">
                Add one more version to compare.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                <GitCompareArrows className="size-4" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  Step 02
                </p>
                <h2 className="text-[15px] font-semibold">The shared job</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-5">
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                type="url"
                value={jobUrl}
                onChange={(event) => setJobUrl(event.target.value)}
                placeholder="Import from a job URL (optional)"
              />
              <Button
                type="button"
                variant="secondary"
                onClick={handleImport}
                disabled={importing}
                className="shrink-0"
              >
                {importing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Link2 className="size-4" />
                )}
                Import
              </Button>
            </div>

            <Textarea
              value={jobText}
              onChange={(event) => setJobText(event.target.value)}
              placeholder="Paste the job description. Every version will be scored against the same requirements."
              className="min-h-[180px]"
              aria-label="Job description"
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="compare-title">Role title (optional)</Label>
                <Input
                  id="compare-title"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                  placeholder="Senior Frontend Engineer"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="compare-company">Company (optional)</Label>
                <Input
                  id="compare-company"
                  value={jobCompany}
                  onChange={(event) => setJobCompany(event.target.value)}
                  placeholder="Lumen Labs"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <p className="flex items-center gap-1.5 text-[10px] text-muted">
            <Sparkles className="size-3.5 text-accent" />
            Same job, same engine, same weights. Only the resume changes.
          </p>
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={pending || files.length < 2 || jobText.trim().length < 60}
          >
            {pending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Comparing… (this can take a minute)
              </>
            ) : (
              <>
                Compare resumes
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium">
            <Plus className="size-3.5 text-accent" />
            What the compare view shows
          </p>
          <p className="mt-1 text-[10px] leading-5 text-muted">
            Each version gets its own six-signal score. The verdict names the
            strongest version and what the runner-up does better.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface/60 px-4 py-3">
          <p className="flex items-center gap-1.5 text-[11px] font-medium">
            <CheckCircle2 className="size-3.5 text-success" />
            Files are parsed in the request
          </p>
          <p className="mt-1 text-[10px] leading-5 text-muted">
            Compare uploads are not added to your resume library. Save a version
            first if you want to reuse it.
          </p>
        </div>
      </div>
    </form>
  );
}
