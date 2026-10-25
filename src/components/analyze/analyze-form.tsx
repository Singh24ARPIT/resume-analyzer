"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ClipboardPaste,
  Cloud,
  FileText,
  HardDrive,
  Link2,
  Loader2,
  Sparkles,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { humanFileSize } from "@/lib/parsing/validate";
import {
  listLocalJobs,
  listLocalResumes,
  saveLocalAnalysis,
  type LocalJob,
  type LocalResume,
} from "@/lib/demo/local";
import type { JobRecord, ResumeRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const PROGRESS_STEPS = [
  "Reading the resume",
  "Extracting job requirements",
  "Scoring six signals",
  "Writing feedback and rewrites",
];

export function AnalyzeForm({
  mode,
  savedResumes,
  savedJobs,
  aiConfigured,
  initialResumeId,
  initialJobId,
}: {
  mode: "demo" | "user";
  savedResumes: ResumeRecord[];
  savedJobs: JobRecord[];
  aiConfigured: boolean;
  initialResumeId?: string;
  initialJobId?: string;
}) {
  const router = useRouter();
  const [resumeSource, setResumeSource] = useState<"upload" | "saved">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [savedResumeId, setSavedResumeId] = useState("");
  const [localResumeId, setLocalResumeId] = useState("");
  const [localResumes, setLocalResumes] = useState<LocalResume[]>([]);
  const [localJobs, setLocalJobs] = useState<LocalJob[]>([]);

  const [jobMode, setJobMode] = useState<"paste" | "url" | "saved">("paste");
  const [jobText, setJobText] = useState("");
  const [jobUrl, setJobUrl] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [jobCompany, setJobCompany] = useState("");
  const [jobSourceUrl, setJobSourceUrl] = useState("");
  const [savedJobId, setSavedJobId] = useState("");

  const [importing, setImporting] = useState(false);
  const [importNote, setImportNote] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [progressStep, setProgressStep] = useState(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const resumes = listLocalResumes();
    const jobs = listLocalJobs();
    setLocalResumes(resumes);
    setLocalJobs(jobs);

    if (initialResumeId) {
      if (initialResumeId.startsWith("local-resume-")) {
        if (resumes.some((entry) => entry.resume.id === initialResumeId)) {
          setResumeSource("saved");
          setLocalResumeId(initialResumeId);
        }
      } else if (mode === "user") {
        setResumeSource("saved");
        setSavedResumeId(initialResumeId);
      }
    }

    if (initialJobId) {
      if (initialJobId.startsWith("local-job-")) {
        const entry = jobs.find((item) => item.job.id === initialJobId);
        if (entry) {
          setJobText(entry.text);
          setJobTitle(entry.job.title);
          setJobCompany(entry.job.company);
          setJobSourceUrl(entry.job.sourceUrl ?? "");
          setJobMode("paste");
        }
      } else if (mode === "user") {
        setJobMode("saved");
        setSavedJobId(initialJobId);
      }
    }
  }, [initialResumeId, initialJobId, mode]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const selectedLocalResume = localResumes.find(
    (entry) => entry.resume.id === localResumeId,
  );

  const hasResume =
    Boolean(file) ||
    (resumeSource === "saved" &&
      Boolean(mode === "demo" ? localResumeId : savedResumeId));

  const hasJob =
    jobMode === "saved" && mode === "user"
      ? Boolean(savedJobId)
      : jobText.trim().length >= 60;

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
      const data = (await response.json()) as {
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

    if (!hasResume) {
      setError("Add a resume file or choose a saved resume.");
      return;
    }

    if (!hasJob) {
      setError(
        jobMode === "saved"
          ? "Choose a saved job description."
          : "Paste at least a few lines of the job description.",
      );
      return;
    }

    setPending(true);
    setProgressStep(0);
    timerRef.current = window.setInterval(() => {
      setProgressStep((step) => Math.min(step + 1, PROGRESS_STEPS.length - 1));
    }, 1500);

    try {
      const formData = new FormData();

      if (file) {
        formData.append("file", file);
      } else if (mode === "demo" && selectedLocalResume) {
        formData.append("resumeText", selectedLocalResume.text);
        formData.append("resumeFileName", selectedLocalResume.resume.fileName);
        formData.append("resumeTitle", selectedLocalResume.resume.title);
      } else if (savedResumeId) {
        formData.append("resumeId", savedResumeId);
      }

      if (jobMode === "saved" && mode === "user" && savedJobId) {
        formData.append("jobId", savedJobId);
      } else {
        formData.append("jobText", jobText);
      }

      formData.append("jobTitle", jobTitle);
      formData.append("jobCompany", jobCompany);
      formData.append("jobSourceUrl", jobSourceUrl);

      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        result?: import("@/lib/types").AnalysisResult;
        local?: boolean;
        error?: string;
      };

      if (!response.ok || !data.result) {
        setError(data.error ?? "The analysis failed. Try again.");
        return;
      }

      if (data.local) {
        saveLocalAnalysis(data.result);
      }

      router.push(`/analyses/${data.result.id}`);
    } catch {
      setError("The analysis failed. Check your connection and try again.");
    } finally {
      if (timerRef.current) window.clearInterval(timerRef.current);
      setPending(false);
      setProgressStep(0);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between gap-3">
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
              <div className="flex rounded-lg border border-border bg-surface-2 p-0.5">
                <button
                  type="button"
                  onClick={() => setResumeSource("upload")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
                    resumeSource === "upload"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted",
                  )}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setResumeSource("saved")}
                  className={cn(
                    "rounded-md px-2.5 py-1 text-[10px] font-medium transition-colors",
                    resumeSource === "saved"
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted",
                  )}
                >
                  Saved
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-5">
            {resumeSource === "upload" ? (
              <>
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
                  <HardDrive className="mt-0.5 size-3.5 shrink-0" />
                  <span>
                    {mode === "demo"
                      ? "Demo mode reads the file locally in the request and never stores it."
                      : "Files are stored in a private Supabase bucket scoped to your account."}
                  </span>
                </div>
              </>
            ) : mode === "demo" ? (
              <div className="space-y-2">
                {localResumes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-4 py-8 text-center">
                    <p className="text-[12px] font-medium">
                      No resumes saved in this browser yet
                    </p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">
                      Upload one from the Resumes page, or use the Upload tab
                      here.
                    </p>
                    <Link
                      href="/resumes"
                      className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                    >
                      Go to resumes <ArrowRight className="size-3" />
                    </Link>
                  </div>
                ) : (
                  localResumes.map((entry) => (
                    <button
                      key={entry.resume.id}
                      type="button"
                      onClick={() => {
                        setLocalResumeId(entry.resume.id);
                        setFile(null);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                        localResumeId === entry.resume.id
                          ? "border-accent/40 bg-accent-soft"
                          : "border-border bg-surface hover:bg-surface-2",
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                        <FileText className="size-3.5 text-muted" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium">
                          {entry.resume.title}
                        </span>
                        <span className="block text-[10px] text-muted">
                          {entry.resume.wordCount} words ·{" "}
                          {entry.resume.skills.slice(0, 3).join(", ") ||
                            "no skills detected"}
                        </span>
                      </span>
                      {localResumeId === entry.resume.id ? (
                        <Check className="size-4 text-accent" />
                      ) : null}
                    </button>
                  ))
                )}
              </div>
            ) : savedResumes.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-4 py-8 text-center">
                <p className="text-[12px] font-medium">No saved resumes yet</p>
                <p className="mt-1 text-[11px] leading-5 text-muted">
                  Save one from the Resumes page, then reuse it for every job.
                </p>
                <Link
                  href="/resumes"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                >
                  Open resume library <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {savedResumes.map((resume) => (
                  <button
                    key={resume.id}
                    type="button"
                    onClick={() => {
                      setSavedResumeId(resume.id);
                      setFile(null);
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                      savedResumeId === resume.id
                        ? "border-accent/40 bg-accent-soft"
                        : "border-border bg-surface hover:bg-surface-2",
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                      <FileText className="size-3.5 text-muted" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">
                        {resume.title}
                      </span>
                      <span className="block text-[10px] text-muted">
                        {resume.wordCount} words · {resume.fileName}
                      </span>
                    </span>
                    {savedResumeId === resume.id ? (
                      <Check className="size-4 text-accent" />
                    ) : null}
                  </button>
                ))}
              </div>
            )}
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
                    ["saved", "Saved"],
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
                    {jobText.trim() ? `${jobText.trim().length.toLocaleString()} characters` : "Job description required"}
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
            ) : jobMode === "url" ? (
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
                  Resume Analyzer reads public job pages, prefers JSON-LD job data, and
                  strips navigation. Some job boards block automated readers; if
                  the import fails, paste the description.
                </p>
              </div>
            ) : mode === "demo" ? (
              localJobs.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-4 py-8 text-center">
                  <p className="text-[12px] font-medium">
                    No job descriptions saved in this browser yet
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">
                    Save one from the Jobs page, or paste the description.
                  </p>
                  <Link
                    href="/jobs"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                  >
                    Open job library <ArrowRight className="size-3" />
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {localJobs.map((entry) => (
                    <button
                      key={entry.job.id}
                      type="button"
                      onClick={() => {
                        setJobText(entry.text);
                        setJobTitle(entry.job.title);
                        setJobCompany(entry.job.company);
                        setJobSourceUrl(entry.job.sourceUrl ?? "");
                        setSavedJobId("");
                        setJobMode("paste");
                      }}
                      className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3 text-left transition-colors hover:bg-surface-2"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                        <BriefcaseBusiness className="size-3.5 text-muted" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[12px] font-medium">
                          {entry.job.title}
                        </span>
                        <span className="block text-[10px] text-muted">
                          {entry.job.company} ·{" "}
                          {entry.job.mustHaveSkills.slice(0, 3).join(", ") ||
                            "no skills extracted"}
                        </span>
                      </span>
                      <ArrowRight className="size-3.5 text-border-strong" />
                    </button>
                  ))}
                </div>
              )
            ) : savedJobs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-4 py-8 text-center">
                <p className="text-[12px] font-medium">No saved jobs yet</p>
                <p className="mt-1 text-[11px] leading-5 text-muted">
                  Save a job description once, then reuse it across resumes.
                </p>
                <Link
                  href="/jobs"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                >
                  Open job library <ArrowRight className="size-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {savedJobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => {
                      setSavedJobId(job.id);
                      setJobTitle(job.title);
                      setJobCompany(job.company);
                      setJobSourceUrl(job.sourceUrl ?? "");
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-colors",
                      savedJobId === job.id
                        ? "border-accent/40 bg-accent-soft"
                        : "border-border bg-surface hover:bg-surface-2",
                    )}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                      <BriefcaseBusiness className="size-3.5 text-muted" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-medium">
                        {job.title}
                      </span>
                      <span className="block text-[10px] text-muted">
                        {job.company} · {job.mustHaveSkills.slice(0, 3).join(", ")}
                      </span>
                    </span>
                    {savedJobId === job.id ? (
                      <Check className="size-4 text-accent" />
                    ) : null}
                  </button>
                ))}
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
                <Cloud className="size-3.5 text-accent" />
                {aiConfigured ? "Gemini feedback enabled" : "Local feedback engine"}
              </span>
              <span className="flex items-center gap-1.5">
                <Wand2 className="size-3.5 text-success" />
                {mode === "demo" ? "No data leaves this browser" : "Private workspace"}
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
                disabled={pending || !hasResume || !hasJob}
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

          {!hasResume && !hasJob ? (
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
              written after the score is fixed.
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
