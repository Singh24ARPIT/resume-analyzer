"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  Link2,
  Loader2,
  Plus,
  ScanSearch,
  Trash2,
  X,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteLocalJob,
  listLocalJobs,
  saveLocalJob,
} from "@/lib/demo/local";
import type { JobRecord } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";

export function JobLibrary({
  mode,
  initialJobs,
}: {
  mode: "demo" | "user";
  initialJobs: JobRecord[];
}) {
  const [jobs, setJobs] = useState<JobRecord[]>(initialJobs);
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"paste" | "url">("paste");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [url, setUrl] = useState("");
  const [importing, setImporting] = useState(false);
  const [pending, setPending] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    if (mode !== "demo") return;
    const local = listLocalJobs().map((entry) => entry.job);
    setJobs((current) => {
      const map = new Map<string, JobRecord>();
      [...local, ...current].forEach((job) => map.set(job.id, job));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, [mode]);

  function resetForm() {
    setText("");
    setTitle("");
    setCompany("");
    setSourceUrl("");
    setUrl("");
    setNote("");
  }

  async function handleImport() {
    setError("");
    setNote("");

    if (!url.trim()) {
      setError("Paste a job posting URL first.");
      return;
    }

    setImporting(true);

    try {
      const response = await fetch("/api/jobs/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
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

      setText(data.text);
      setTitle(data.title ?? "");
      setCompany(data.company ?? "");
      setSourceUrl(data.sourceUrl ?? url.trim());
      setTab("paste");
      setNote("Posting imported. Review the text, then save it.");
    } catch {
      setError("That page could not be imported.");
    } finally {
      setImporting(false);
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (text.trim().length < 60) {
      setError("Paste a fuller job description before saving.");
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          title: title.trim(),
          company: company.trim(),
          sourceUrl: sourceUrl.trim(),
        }),
      });
      const data = (await response.json()) as {
        job?: JobRecord;
        local?: boolean;
        error?: string;
      };

      if (!response.ok || !data.job) {
        setError(data.error ?? "That job could not be saved.");
        return;
      }

      if (data.local) {
        saveLocalJob({ job: data.job, text: text.trim() });
      }

      setJobs((current) => [
        data.job!,
        ...current.filter((job) => job.id !== data.job!.id),
      ]);
      resetForm();
      setOpen(false);
    } catch {
      setError("That job could not be saved.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(job: JobRecord) {
    if (mode === "demo" && !job.id.startsWith("local-job-")) return;

    if (!window.confirm(`Delete "${job.title}"?`)) return;

    setDeletingId(job.id);
    setError("");

    try {
      if (job.id.startsWith("local-job-")) {
        deleteLocalJob(job.id);
      } else {
        const response = await fetch(`/api/jobs/${job.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setError(data.error ?? "That job could not be deleted.");
          return;
        }
      }

      setJobs((current) => current.filter((item) => item.id !== job.id));
    } catch {
      setError("That job could not be deleted.");
    } finally {
      setDeletingId("");
    }
  }

  const isSample = (job: JobRecord) =>
    mode === "demo" && !job.id.startsWith("local-job-");

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">Job descriptions</h2>
            <p className="mt-1 text-[11px] text-muted">
              {mode === "demo"
                ? "Saved in this browser. Sample jobs are read-only."
                : "Real roles you have saved for reuse."}
            </p>
          </div>
          <Button
            type="button"
            variant={open ? "secondary" : "accent"}
            size="sm"
            onClick={() => {
              setOpen((value) => !value);
              setError("");
            }}
          >
            {open ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            {open ? "Close" : "Add job"}
          </Button>
        </CardHeader>

        {open ? (
          <CardContent className="border-t border-border pt-5">
            <div className="mb-4 flex rounded-lg border border-border bg-surface-2 p-0.5">
              {(
                [
                  ["paste", "Paste description"],
                  ["url", "Import from URL"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex-1 rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors",
                    tab === key
                      ? "bg-surface text-foreground shadow-sm"
                      : "text-muted",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            {error ? (
              <Alert tone="error" className="mb-4">
                {error}
              </Alert>
            ) : null}
            {note ? (
              <Alert tone="success" className="mb-4 text-[11px]">
                {note}
              </Alert>
            ) : null}

            <form onSubmit={handleSave} className="space-y-3">
              {tab === "url" ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Input
                    type="url"
                    value={url}
                    onChange={(event) => setUrl(event.target.value)}
                    placeholder="https://company.com/careers/role"
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
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="job-text">Job description</Label>
                <Textarea
                  id="job-text"
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  placeholder="Paste the full description. Requirements and responsibilities matter most."
                  className="min-h-[180px]"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="job-title">Role title (optional)</Label>
                  <Input
                    id="job-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Senior Frontend Engineer"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="job-company">Company (optional)</Label>
                  <Input
                    id="job-company"
                    value={company}
                    onChange={(event) => setCompany(event.target.value)}
                    placeholder="Lumen Labs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    resetForm();
                    setOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="accent" disabled={pending}>
                  {pending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving…
                    </>
                  ) : (
                    "Save job"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        ) : null}
      </Card>

      {error && !open ? <Alert tone="error">{error}</Alert> : null}

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted-strong card-shadow">
            <BriefcaseBusiness className="size-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No saved jobs</h3>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
            Save a description once, then run several resumes against it.
          </p>
          <Button
            type="button"
            variant="accent"
            size="sm"
            className="mt-5"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-3.5" />
            Add a job description
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {jobs.map((job) => {
            const sample = isSample(job);
            const deleting = deletingId === job.id;

            return (
              <Card key={job.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2">
                        <BriefcaseBusiness className="size-4.5 text-muted-strong" />
                      </span>
                      <div className="min-w-0">
                        <h3 className="truncate text-[13px] font-semibold">
                          {job.title}
                        </h3>
                        <p className="truncate text-[10px] text-muted">
                          {job.company}
                        </p>
                      </div>
                    </div>
                    {sample ? (
                      <Badge variant="outline">Sample</Badge>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {job.mustHaveSkills.slice(0, 6).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[9px] text-muted-strong"
                      >
                        {skill}
                      </span>
                    ))}
                    {job.mustHaveSkills.length === 0 ? (
                      <span className="text-[9px] text-muted">
                        No must-have skills extracted
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                    <div className="flex min-w-0 items-center gap-3 text-[10px] text-muted">
                      <span>{formatRelativeDate(job.createdAt)}</span>
                      {job.sourceUrl ? (
                        <a
                          href={job.sourceUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="flex items-center gap-0.5 truncate hover:text-foreground"
                        >
                          Source <ArrowUpRight className="size-2.5" />
                        </a>
                      ) : null}
                    </div>

                    {sample ? (
                      <span className="text-[10px] text-muted">Read-only</span>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Link
                          href={`/analyze?job=${job.id}`}
                          className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[10px] font-medium transition-colors hover:bg-border"
                        >
                          <ScanSearch className="size-3" />
                          Analyze
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(job)}
                          disabled={deleting}
                          className="flex size-7 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-danger/30 hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                          aria-label={`Delete ${job.title}`}
                        >
                          {deleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
