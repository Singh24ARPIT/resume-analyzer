"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Download,
  FileText,
  Loader2,
  PenLine,
  Sparkles,
  Trash2,
} from "lucide-react";
import { CopyButton } from "@/components/report/copy-button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { downloadCoverLetterDocx } from "@/lib/export/docx";
import {
  deleteLocalLetter,
  listLocalAnalyses,
  listLocalLetters,
  localAnalysesToSummaries,
  loadLocalAnalysis,
  saveLocalLetter,
} from "@/lib/demo/local";
import type {
  AnalysisSummary,
  CoverLetterRecord,
  CoverLetterTone,
} from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

const TONES: Array<{ value: CoverLetterTone; label: string; hint: string }> = [
  { value: "professional", label: "Professional", hint: "Measured and direct" },
  { value: "enthusiastic", label: "Enthusiastic", hint: "Warm and energetic" },
  { value: "concise", label: "Concise", hint: "Short paragraphs" },
];

export function CoverLettersView({
  mode,
  analyses,
  initialLetters,
  initialAnalysisId,
}: {
  mode: "demo" | "user";
  analyses: AnalysisSummary[];
  initialLetters: CoverLetterRecord[];
  initialAnalysisId?: string;
}) {
  const [analysisOptions, setAnalysisOptions] =
    useState<AnalysisSummary[]>(analyses);
  const [letters, setLetters] = useState<CoverLetterRecord[]>(initialLetters);
  const [selectedAnalysisId, setSelectedAnalysisId] = useState(
    initialAnalysisId || analyses[0]?.id || "",
  );
  const [tone, setTone] = useState<CoverLetterTone>("professional");
  const [selectedLetterId, setSelectedLetterId] = useState(
    initialLetters[0]?.id ?? "",
  );
  const [generating, setGenerating] = useState(false);
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "demo") return;

    const localAnalyses = listLocalAnalyses();
    const localSummaries = localAnalysesToSummaries(localAnalyses);
    const localLetters = listLocalLetters();

    setAnalysisOptions((current) => {
      const map = new Map<string, AnalysisSummary>();
      [...localSummaries, ...current].forEach((item) => map.set(item.id, item));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });

    setLetters((current) => {
      const map = new Map<string, CoverLetterRecord>();
      [...localLetters, ...current].forEach((item) => map.set(item.id, item));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, [mode]);

  useEffect(() => {
    if (!selectedAnalysisId && analysisOptions[0]) {
      setSelectedAnalysisId(analysisOptions[0].id);
    }
  }, [analysisOptions, selectedAnalysisId]);

  const selectedLetter = useMemo(
    () => letters.find((letter) => letter.id === selectedLetterId) ?? letters[0],
    [letters, selectedLetterId],
  );

  async function handleGenerate() {
    setError("");

    if (!selectedAnalysisId) {
      setError("Pick an analysis first.");
      return;
    }

    setGenerating(true);

    try {
      const payload: {
        analysisId: string;
        tone: CoverLetterTone;
        analysis?: unknown;
      } = { analysisId: selectedAnalysisId, tone };

      if (mode === "demo" && selectedAnalysisId.startsWith("local-")) {
        payload.analysis = loadLocalAnalysis(selectedAnalysisId);
      }

      const response = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as {
        letter?: CoverLetterRecord;
        local?: boolean;
        error?: string;
      };

      if (!response.ok || !data.letter) {
        setError(data.error ?? "The cover letter could not be generated.");
        return;
      }

      if (data.local) saveLocalLetter(data.letter);

      setLetters((current) => [
        data.letter!,
        ...current.filter((letter) => letter.id !== data.letter!.id),
      ]);
      setSelectedLetterId(data.letter.id);
    } catch {
      setError("The cover letter could not be generated. Try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleDelete(letter: CoverLetterRecord) {
    if (letter.id === "sample-letter") return;
    if (!window.confirm("Delete this cover letter?")) return;

    setDeletingId(letter.id);
    setError("");

    try {
      if (letter.id.startsWith("local-letter-")) {
        deleteLocalLetter(letter.id);
      } else {
        const response = await fetch(`/api/cover-letters/${letter.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setError(data.error ?? "That letter could not be deleted.");
          return;
        }
      }

      setLetters((current) => {
        const next = current.filter((item) => item.id !== letter.id);
        if (selectedLetterId === letter.id) {
          setSelectedLetterId(next[0]?.id ?? "");
        }
        return next;
      });
    } catch {
      setError("That letter could not be deleted.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-4">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-2.5">
                <span className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2">
                  <PenLine className="size-4" />
                </span>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                    Generator
                  </p>
                  <h2 className="text-[15px] font-semibold">Write a first draft</h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              {analysisOptions.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border-strong bg-surface-2/60 px-4 py-8 text-center">
                  <p className="text-[12px] font-medium">
                    No analysis to build from yet
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-muted">
                    A cover letter is grounded in a completed report, so the
                    claims stay tied to your resume.
                  </p>
                  <Link
                    href="/analyze"
                    className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                  >
                    Run an analysis <ArrowRight className="size-3" />
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <Label htmlFor="analysis-select">Base it on</Label>
                    <select
                      id="analysis-select"
                      value={selectedAnalysisId}
                      onChange={(event) =>
                        setSelectedAnalysisId(event.target.value)
                      }
                      className="h-11 w-full rounded-xl border border-border bg-surface px-3 text-[12px] outline-none focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                    >
                      {analysisOptions.map((analysis) => (
                        <option key={analysis.id} value={analysis.id}>
                          {analysis.jobTitle} · {analysis.company} (
                          {analysis.overallScore}/100)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Tone</Label>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {TONES.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setTone(option.value)}
                          className={cn(
                            "rounded-xl border px-3 py-2 text-left transition-colors",
                            tone === option.value
                              ? "border-accent/40 bg-accent-soft"
                              : "border-border bg-surface hover:bg-surface-2",
                          )}
                        >
                          <span className="block text-[11px] font-medium">
                            {option.label}
                          </span>
                          <span className="block text-[9px] text-muted">
                            {option.hint}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="accent"
                    className="w-full"
                    onClick={handleGenerate}
                    disabled={generating}
                  >
                    {generating ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Writing the draft…
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Generate cover letter
                      </>
                    )}
                  </Button>

                  <p className="text-[10px] leading-5 text-muted">
                    The draft uses only facts from the selected report and
                    resume. Edit it before sending.
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-[14px] font-semibold">Saved letters</h2>
                <Badge variant="outline">{letters.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-0">
              {letters.length === 0 ? (
                <p className="border-t border-border px-5 py-6 text-center text-[11px] text-muted sm:px-6">
                  No cover letters yet. Generate one above.
                </p>
              ) : (
                <div className="border-t border-border">
                  {letters.map((letter) => (
                    <button
                      key={letter.id}
                      type="button"
                      onClick={() => setSelectedLetterId(letter.id)}
                      className={cn(
                        "flex w-full items-center gap-3 border-b border-border px-5 py-3 text-left transition-colors last:border-b-0 sm:px-6",
                        selectedLetter?.id === letter.id
                          ? "bg-surface-2"
                          : "hover:bg-surface-2",
                      )}
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-surface">
                        <FileText className="size-3.5 text-muted" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium">
                          {letter.title}
                        </span>
                        <span className="block text-[9px] text-muted">
                          {letter.tone} · {formatDate(letter.createdAt)}
                        </span>
                      </span>
                      {letter.id === "sample-letter" ? (
                        <Badge variant="outline">Sample</Badge>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Card className="min-h-[420px]">
          {selectedLetter ? (
            <>
              <CardHeader className="flex flex-row items-start justify-between gap-3 border-b border-border">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{selectedLetter.tone}</Badge>
                    <span className="font-mono text-[9px] text-muted">
                      {formatDate(selectedLetter.createdAt)}
                    </span>
                  </div>
                  <h2 className="mt-2 truncate text-[15px] font-semibold">
                    {selectedLetter.title}
                  </h2>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <CopyButton text={selectedLetter.body} label="Copy" />
                  <button
                    type="button"
                    onClick={() =>
                      downloadCoverLetterDocx({
                        title: selectedLetter.title,
                        body: selectedLetter.body,
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[10px] font-medium text-muted-strong transition-colors hover:bg-surface-2 hover:text-foreground"
                  >
                    <Download className="size-3" />
                    DOCX
                  </button>
                  {selectedLetter.id !== "sample-letter" ? (
                    <button
                      type="button"
                      onClick={() => handleDelete(selectedLetter)}
                      disabled={deletingId === selectedLetter.id}
                      className="flex size-7 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-danger/30 hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                      aria-label="Delete cover letter"
                    >
                      {deletingId === selectedLetter.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="whitespace-pre-wrap rounded-xl border border-border bg-surface-2 p-5 text-[12px] leading-6 text-muted-strong">
                  {selectedLetter.body}
                </div>
                <p className="mt-3 text-[10px] leading-5 text-muted">
                  Generated from a report, not from a blank prompt. Read it once
                  for tone, then edit anything that does not sound like you.
                </p>
              </CardContent>
            </>
          ) : (
            <CardContent className="flex h-full min-h-[420px] flex-col items-center justify-center text-center">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface-2 text-muted">
                <PenLine className="size-5" />
              </div>
              <h2 className="mt-4 text-[15px] font-semibold">
                Your letter preview appears here
              </h2>
              <p className="mt-1.5 max-w-xs text-[11px] leading-5 text-muted">
                Pick an analysis, choose a tone, and generate a grounded first
                draft you can edit.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
