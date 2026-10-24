"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  FileText,
  Loader2,
  Plus,
  ScanSearch,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { humanFileSize } from "@/lib/parsing/validate";
import {
  deleteLocalResume,
  listLocalResumes,
  saveLocalResume,
} from "@/lib/demo/local";
import type { ResumeRecord } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";

export function ResumeLibrary({
  mode,
  initialResumes,
}: {
  mode: "demo" | "user";
  initialResumes: ResumeRecord[];
}) {
  const [resumes, setResumes] = useState<ResumeRecord[]>(initialResumes);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [pending, setPending] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (mode !== "demo") return;
    const local = listLocalResumes().map((entry) => entry.resume);
    setResumes((current) => {
      const map = new Map<string, ResumeRecord>();
      [...local, ...current].forEach((resume) => map.set(resume.id, resume));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, [mode]);

  async function handleUpload(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a PDF or DOCX file first.");
      return;
    }

    setPending(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (title.trim()) formData.append("title", title.trim());

      const response = await fetch("/api/resumes", {
        method: "POST",
        body: formData,
      });
      const data = (await response.json()) as {
        resume?: ResumeRecord;
        text?: string;
        local?: boolean;
        error?: string;
      };

      if (!response.ok || !data.resume) {
        setError(data.error ?? "That resume could not be saved.");
        return;
      }

      if (data.local && data.text) {
        saveLocalResume({ resume: data.resume, text: data.text });
      }

      setResumes((current) => [
        data.resume!,
        ...current.filter((resume) => resume.id !== data.resume!.id),
      ]);
      setFile(null);
      setTitle("");
      setOpen(false);
      if (inputRef.current) inputRef.current.value = "";
    } catch {
      setError("That resume could not be saved. Try again.");
    } finally {
      setPending(false);
    }
  }

  async function handleDelete(resume: ResumeRecord) {
    if (resume.filePath.startsWith("demo/")) return;

    if (
      !window.confirm(
        `Delete "${resume.title}"? Analyses that used this resume will also be removed.`,
      )
    ) {
      return;
    }

    setDeletingId(resume.id);
    setError("");

    try {
      if (resume.id.startsWith("local-resume-")) {
        deleteLocalResume(resume.id);
      } else {
        const response = await fetch(`/api/resumes/${resume.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setError(data.error ?? "That resume could not be deleted.");
          return;
        }
      }

      setResumes((current) => current.filter((item) => item.id !== resume.id));
    } catch {
      setError("That resume could not be deleted.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-3">
          <div>
            <h2 className="text-[15px] font-semibold">Resume library</h2>
            <p className="mt-1 text-[11px] text-muted">
              {mode === "demo"
                ? "Saved in this browser. Sample resumes are marked and cannot be deleted."
                : "Stored privately in your Supabase bucket."}
            </p>
          </div>
          <Button
            type="button"
            variant={open ? "secondary" : "accent"}
            size="sm"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            {open ? "Close" : "Upload resume"}
          </Button>
        </CardHeader>

        {open ? (
          <CardContent className="border-t border-border pt-5">
            {error ? (
              <Alert tone="error" className="mb-4">
                {error}
              </Alert>
            ) : null}

            <form onSubmit={handleUpload} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <div className="space-y-1.5">
                <Label htmlFor="resume-upload">File</Label>
                <input
                  ref={inputRef}
                  id="resume-upload"
                  type="file"
                  accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                  className="block w-full cursor-pointer rounded-xl border border-border bg-surface px-3 py-2 text-[11px] file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-2.5 file:py-1.5 file:text-[10px] file:font-medium file:text-foreground"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="resume-title">Display title (optional)</Label>
                <Input
                  id="resume-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="Arpit Singh — Frontend"
                />
              </div>
              <Button type="submit" variant="accent" disabled={pending || !file}>
                {pending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Upload className="size-4" />
                    Save resume
                  </>
                )}
              </Button>
            </form>
            <p className="mt-2 text-[10px] text-muted">
              PDF or DOCX, up to 5 MB. Scanned PDFs without a text layer are
              rejected.
            </p>
          </CardContent>
        ) : null}
      </Card>

      {error && !open ? <Alert tone="error">{error}</Alert> : null}

      {resumes.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/50 px-6 py-16 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted-strong card-shadow">
            <FileText className="size-5" />
          </div>
          <h3 className="mt-4 text-base font-semibold">No resumes yet</h3>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-muted">
            Upload a version once, then reuse it for every job you analyze.
          </p>
          <Button
            type="button"
            variant="accent"
            size="sm"
            className="mt-5"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-3.5" />
            Upload your first resume
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {resumes.map((resume) => {
            const isSample = resume.filePath.startsWith("demo/");
            const isDeleting = deletingId === resume.id;

            return (
              <Card key={resume.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2">
                      <FileText className="size-4.5 text-muted-strong" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      {isSample ? (
                        <Badge variant="outline">Sample</Badge>
                      ) : (
                        <Badge variant="success">Saved</Badge>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3 line-clamp-2 text-[13px] font-semibold leading-5">
                    {resume.title}
                  </h3>
                  <p className="mt-0.5 truncate text-[10px] text-muted">
                    {resume.fileName}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted">
                    <span>{resume.wordCount} words</span>
                    <span>{humanFileSize(resume.fileSize)}</span>
                    <span>{formatRelativeDate(resume.createdAt)}</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1">
                    {resume.skills.slice(0, 5).map((skill) => (
                      <span
                        key={skill}
                        className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[9px] text-muted-strong"
                      >
                        {skill}
                      </span>
                    ))}
                    {resume.skills.length > 5 ? (
                      <span className="px-1 py-0.5 text-[9px] text-muted">
                        +{resume.skills.length - 5}
                      </span>
                    ) : null}
                    {resume.skills.length === 0 ? (
                      <span className="text-[9px] text-muted">
                        No skills detected
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-auto flex items-center gap-2 border-t border-border pt-3">
                    {isSample ? (
                      <span className="text-[10px] text-muted">
                        Sample data for the demo
                      </span>
                    ) : (
                      <>
                        <Link
                          href={`/analyze?resume=${resume.id}`}
                          className={cn(
                            "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[10px] font-medium transition-colors hover:bg-border",
                          )}
                        >
                          <ScanSearch className="size-3" />
                          Analyze
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(resume)}
                          disabled={isDeleting}
                          className="flex size-7 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-danger/30 hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                          aria-label={`Delete ${resume.title}`}
                        >
                          {isDeleting ? (
                            <Loader2 className="size-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="size-3.5" />
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface-2 px-4 py-3">
        <p className="text-[10px] leading-5 text-muted">
          Keep one master resume per target role type. Comparing versions against
          the same job is the fastest way to see what actually improved.
        </p>
        <Link
          href="/compare"
          className="hidden shrink-0 items-center gap-1 text-[11px] font-medium text-accent hover:underline sm:flex"
        >
          Compare versions <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
