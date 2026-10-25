"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardPaste,
  FileText,
  Link2,
  Loader2,
  LockKeyhole,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { AnalysisReport } from "@/components/report/analysis-report";
import {
  ExportJsonButton,
  PrintButton,
} from "@/components/report/report-actions";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { humanFileSize } from "@/lib/parsing/validate";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROGRESS_STEPS = [
  "Reading the resume",
  "Extracting job requirements",
  "Scoring six signals",
  "Writing feedback and rewrites",
];

export function AnalyzeWorkspace({
  aiConfigured,
}: {
  aiConfigured: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [jobMode, setJobMode] = useState<"paste" | "url">("paste");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobSourceUrl, setJobSourceUrl] = useState("");

  const [importing, setImporting] = useState(false);
  const [importNote, setImportNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!result) return;
    document
      .getElementById("analysis-result")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [result]);

  const hasJob = jobText.trim().length >= 60;

  async function handleImport() {
    setImportNote("");
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
      const data = (await response.json().catch(() => ({}))) as {
        text?: string;
        title?: string;
        company?: string;
        sourceUrl?: string;
        error?: string;
      };

      if (!response.ok || !data.text) {
        setError(data.error ?? "That page could not be imported.");
        return;
      }

      setJobText(data.text);
      setJobTitle(data.title ?? "");
      setJobCompany(data.company ?? "");
      setJobSourceUrl(data.sourceUrl ?? jobUrl.trim());
      setJobMode("paste");
      setImportNote(
        `Imported ${data.text.length.toLocaleString()} characters. Review the description before running the analysis.`,
      );
    } catch {
      setError("That page could not be imported. Paste the description instead.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a PDF or DOCX resume first.");
      return;
    }

    if (!hasJob) {
      setError("Paste at least a few lines of the job description.");
      return;
    }

    setPending(true);
    setProgressStep(0);
    timerRef.current = window.setInterval(() => {
      setProgressStep((step) => Math.min(step + 1, PROGRESS_STEPS.length - 1));
    }, 1500);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobText", jobText);
      formData.append("jobTitle", jobTitle);
      formData.append("jobCompany", jobCompany);
      formData.append("jobSourceUrl", jobSourceUrl);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json().catch(() => ({}))) as {
        result?: AnalysisResult;
        error?: string;
      };

      if (!response.ok || !data.result) {
        setError(data.error ?? "The analysis failed. Try again.");
        return;
      }

      setResult(data.result);
    } catch {
      setError("The analysis failed. Check your connection and try again.");
    } finally {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setPending(false);
      setProgressStep(0);
    }
  }

  function reset() {
    setResult(null);
    setFile(null);
    setJobText("");
    setJobUrl("");
    setJobTitle("");
    setJobCompany("");
    setJobSourceUrl("");
    setImportNote("");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (result) {
    return (
      <div id="analysis-result" className="scroll-mt-24 space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Badge variant="accent">
              <CheckCircle2 className="size-3" />
              Analysis complete
            </Badge>
            <h2 className="mt-2 text-[26px] font-semibold leading-tight tracking-[-0.035em] sm:text-[30px]">
              {result.job.title}
            </h2>
            <p className="mt-1 text-sm text-muted">
              {result.job.company} · {result.resume.title} ·{" "}
              {result.resume.wordCount.toLocaleString()} words
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <PrintButton />
            <ExportJsonButton result={result} />
            <Button variant="accent" onClick={reset}>
              <RotateCcw className="size-4" />
              New analysis
            </Button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl border border-success/20 bg-success-soft px-3.5 py-2.5 text-[11px] leading-5 text-success print:hidden">
          <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Nothing was saved. This report exists only in this browser tab —
            print it or export the JSON before refreshing.
          </span>
        </div>

        <AnalysisReport result={result} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
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
                <h2 className="text-[15px] font-semibold">Your resume</h2>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="sr-only"
              onChange={(event) => {
                const next = event.target.files?.[0] ?? null;
                setFile(next);
                setError("");
              }}
            />

            {file ? (
              <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-soft text-success">
                  <CheckCircle2 className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium">{file.name}</p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {humanFileSize(file.size)} · ready to parse
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFile(null)}
                  className="flex size-8 items-center justify-center rounded-lg text-muted hover:bg-surface hover:text-foreground"
                  aria-label="Remove file"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label
                htmlFor="resume-file"
                className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-6 py-11 text-center transition-colors hover:border-accent/40 hover:bg-accent-soft/30"
              >
                <span className="flex size-11 items-center justify-center rounded-xl border border-border bg-surface text-muted-strong card-shadow transition-colors group-hover:text-accent">
                  <Upload className="size-5" />
                </span>
                <span className="mt-3 text-[13px] font-medium">
                  Choose a PDF or DOCX
                </span>
                <span className="mt-1 text-[11px] text-muted">
                  Up to 5 MB · text-based files only
                </span>
              </label>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-[10px] leading-5 text-muted">
              <LockKeyhole className="mt-0.5 size-3.5 shrink-0" />
              <span>
                The file is parsed in memory for this request and is never written
                to disk or a database.
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                  <BriefcaseBusiness className="size-4" />
                </span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                    Step 02
                  </p>
                  <h2 className="text-[15px] font-semibold">The job</h2>
                </div>
              </div>
              <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
                {(
                  [
                    ["paste", "Paste"],
                    ["url", "URL"],
                  ] as const
                ).map(([key, label]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setJobMode(key)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
                      jobMode === key
                        ? "bg-surface text-foreground shadow-sm"
                        : "text-muted",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {jobMode === "paste" ? (
              <div className="space-y-3">
                {importNote ? (
                  <Alert tone="success" className="text-[11px]">
                    {importNote}
                  </Alert>
                ) : null}
                <Textarea
                  value={jobText}
                  onChange={(event) => setJobText(event.target.value)}
                  placeholder="Paste the job description here — responsibilities, requirements, and the tech stack. The more complete it is, the better the skill extraction."
                  className="min-h-[190px]"
                  aria-label="Job description"
                />
                <div className="flex items-center justify-between text-[10px] text-muted">
                  <span className="flex items-center gap-1.5">
                    <ClipboardPaste className="size-3" />
                    {jobText.trim()
                      ? `${jobText.trim().length.toLocaleString()} characters`
                      : "Job description required"}
                  </span>
                  {jobText.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setJobText("")}
                      className="hover:text-foreground"
                    >
                      Clear
                    </button>
                  ) : null}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="jobTitle">Role title (optional)</Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(event) => setJobTitle(event.target.value)}
                      placeholder="Senior Frontend Engineer"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="jobCompany">Company (optional)</Label>
                    <Input
                      id="jobCompany"
                      value={jobCompany}
                      onChange={(event) => setJobCompany(event.target.value)}
                      placeholder="Lumen Labs"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="jobUrl">Job posting URL</Label>
                  <Input
                    id="jobUrl"
                    type="url"
                    value={jobUrl}
                    onChange={(event) => setJobUrl(event.target.value)}
                    placeholder="https://company.com/careers/role"
                  />
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleImport}
                  disabled={importing}
                  className="w-full"
                >
                  {importing ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Reading the posting…
                    </>
                  ) : (
                    <>
                      <Link2 className="size-4" />
                      Import job description
                    </>
                  )}
                </Button>
                <p className="text-[10px] leading-5 text-muted">
                  Resume Analyzer reads public job pages, prefers JSON-LD job data,
                  and strips navigation. Some job boards block automated readers;
                  if the import fails, paste the description.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-4">
        <CardContent className="flex flex-col gap-4 p-5 sm:p-6">
          {error ? <Alert tone="error">{error}</Alert> : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-muted">
              <span className="flex items-center gap-1.5">
                <Wand2 className="size-3.5 text-success" />
                {aiConfigured ? "Gemini feedback enabled" : "Local feedback engine"}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-success" />
                Nothing stored
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="size-3.5 text-warning" />
                Scores are deterministic
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden sm:inline-flex">
                ~30 seconds
              </Badge>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={pending || !file || !hasJob}
                className="w-full sm:w-auto"
              >
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Analyze match
                    <ArrowRight className="size-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {!file || !hasJob ? (
            <p className="text-[10px] text-muted">
              Add a resume and a job description to enable the analysis.
            </p>
          ) : null}
        </CardContent>
      </Card>

      {pending ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 px-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 card-shadow">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-soft text-accent">
                <Sparkles className="size-5" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                  Analysis in progress
                </p>
                <p className="text-[15px] font-semibold">
                  Building your match report
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {PROGRESS_STEPS.map((step, index) => {
                const complete = index < progressStep;
                const active = index === progressStep;

                return (
                  <div key={step} className="flex items-center gap-3">
                    <span
                      className={cn(
                        "flex size-6 shrink-0 items-center justify-center rounded-full border text-[10px]",
                        complete
                          ? "border-success/20 bg-success-soft text-success"
                          : active
                            ? "border-accent/30 bg-accent-soft text-accent"
                            : "border-border bg-surface-2 text-muted",
                      )}
                    >
                      {complete ? (
                        <Check className="size-3" />
                      ) : active ? (
                        <Loader2 className="size-3 animate-spin" />
                      ) : (
                        index + 1
                      )}
                    </span>
                    <span
                      className={cn(
                        "text-[12px]",
                        complete
                          ? "text-muted-strong"
                          : active
                            ? "font-medium text-foreground"
                            : "text-muted",
                      )}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>

            <p className="mt-5 border-t border-border pt-3 text-[10px] leading-5 text-muted">
              The score comes from the deterministic engine. AI feedback is
              written after the score is fixed. Your file is discarded when the
              response is returned.
            </p>
          </div>
        </div>
      ) : null}

      <p className="mt-4 text-[10px] leading-5 text-muted">
        Tip: include the full requirements section, not just the first paragraph
        of the posting.
      </p>
    </form>
  );
}
