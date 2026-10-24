"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  History,
  Loader2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  deleteLocalAnalysis,
  listLocalAnalyses,
  localAnalysesToSummaries,
} from "@/lib/demo/local";
import type { AnalysisSummary } from "@/lib/types";
import { cn, formatRelativeDate, scoreBand } from "@/lib/utils";

type Filter = "all" | "strong" | "moderate" | "low";

function matchesFilter(score: number, filter: Filter) {
  if (filter === "all") return true;
  if (filter === "strong") return score >= 70;
  if (filter === "moderate") return score >= 55 && score < 70;
  return score < 55;
}

function scoreClass(score: number) {
  if (score >= 70) return "border-success/20 bg-success-soft text-success";
  if (score >= 55) return "border-accent/20 bg-accent-soft text-accent";
  return "border-danger/20 bg-danger-soft text-danger";
}

export function HistoryView({
  mode,
  initialAnalyses,
}: {
  mode: "demo" | "user";
  initialAnalyses: AnalysisSummary[];
}) {
  const [analyses, setAnalyses] =
    useState<AnalysisSummary[]>(initialAnalyses);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode !== "demo") return;

    const local = localAnalysesToSummaries(listLocalAnalyses());
    setAnalyses((current) => {
      const map = new Map<string, AnalysisSummary>();
      [...local, ...current].forEach((item) => map.set(item.id, item));
      return Array.from(map.values()).sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    });
  }, [mode]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return analyses.filter((analysis) => {
      if (!matchesFilter(analysis.overallScore, filter)) return false;
      if (!needle) return true;
      return `${analysis.jobTitle} ${analysis.company} ${analysis.resumeTitle}`
        .toLowerCase()
        .includes(needle);
    });
  }, [analyses, filter, query]);

  function isSample(id: string) {
    return mode === "demo" && !id.startsWith("local-");
  }

  async function handleDelete(analysis: AnalysisSummary) {
    if (isSample(analysis.id)) return;
    if (!window.confirm(`Delete the analysis for "${analysis.jobTitle}"?`)) {
      return;
    }

    setDeletingId(analysis.id);
    setError("");

    try {
      if (analysis.id.startsWith("local-")) {
        deleteLocalAnalysis(analysis.id);
      } else {
        const response = await fetch(`/api/analyses/${analysis.id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setError(data.error ?? "That analysis could not be deleted.");
          return;
        }
      }

      setAnalyses((current) =>
        current.filter((item) => item.id !== analysis.id),
      );
    } catch {
      setError("That analysis could not be deleted.");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <div className="space-y-4">
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search role, company, or resume"
              className="h-9 pl-9 text-[12px]"
              aria-label="Search analyses"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(
              [
                ["all", "All"],
                ["strong", "70+"],
                ["moderate", "55–69"],
                ["low", "Below 55"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-lg border px-2.5 py-1.5 text-[10px] font-medium transition-colors",
                  filter === value
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-surface text-muted-strong hover:bg-surface-2",
                )}
              >
                {label}
              </button>
            ))}
            <span className="ml-1 font-mono text-[10px] text-muted">
              {filtered.length} / {analyses.length}
            </span>
          </div>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={History}
          title={analyses.length ? "No analyses match those filters" : "No analyses yet"}
          description={
            analyses.length
              ? "Try a different search term or score range."
              : "Run an analysis to start building a history you can compare against."
          }
          action={
            <Link
              href="/analyze"
              className={buttonVariants({ variant: "accent", size: "sm" })}
            >
              <Plus className="size-3.5" />
              New analysis
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="hidden grid-cols-[1fr_150px_90px_110px_80px] items-center gap-4 border-b border-border bg-surface-2 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[0.12em] text-muted lg:grid">
            <span>Role</span>
            <span>Resume</span>
            <span className="text-center">Score</span>
            <span>When</span>
            <span />
          </div>

          <div className="divide-y divide-border">
            {filtered.map((analysis) => (
              <div
                key={analysis.id}
                className="group flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-surface-2 sm:px-5 lg:grid lg:grid-cols-[1fr_150px_90px_110px_80px] lg:items-center lg:gap-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/analyses/${analysis.id}`}
                    className="block truncate text-[13px] font-medium hover:underline"
                  >
                    {analysis.jobTitle}
                  </Link>
                  <p className="mt-0.5 truncate text-[10px] text-muted">
                    {analysis.company}
                    {isSample(analysis.id) ? " · sample analysis" : ""}
                  </p>
                </div>

                <p className="hidden truncate text-[11px] text-muted lg:block">
                  {analysis.resumeTitle}
                </p>

                <div className="flex items-center justify-between gap-3 lg:justify-center">
                  <span
                    className={cn(
                      "inline-flex min-w-9 items-center justify-center rounded-lg border px-2 py-1 font-mono text-[12px] font-semibold",
                      scoreClass(analysis.overallScore),
                    )}
                  >
                    {analysis.overallScore}
                  </span>
                  <span className="text-[10px] text-muted lg:hidden">
                    {scoreBand(analysis.overallScore).label}
                  </span>
                </div>

                <p className="text-[10px] text-muted">
                  {formatRelativeDate(analysis.createdAt)}
                </p>

                <div className="flex items-center justify-end gap-1.5">
                  <Link
                    href={`/analyses/${analysis.id}`}
                    className="inline-flex items-center gap-1 rounded-lg bg-surface-2 px-2.5 py-1.5 text-[10px] font-medium transition-colors hover:bg-border"
                  >
                    Open
                    <ArrowRight className="size-3" />
                  </Link>
                  {isSample(analysis.id) ? (
                    <Badge variant="outline" className="hidden xl:inline-flex">
                      Sample
                    </Badge>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleDelete(analysis)}
                      disabled={deletingId === analysis.id}
                      className="flex size-7 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-danger/30 hover:bg-danger-soft hover:text-danger disabled:opacity-50"
                      aria-label={`Delete ${analysis.jobTitle}`}
                    >
                      {deletingId === analysis.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3 sm:flex-row sm:items-center">
        <p className="flex items-center gap-1.5 text-[10px] text-muted">
          <BarChart3 className="size-3.5" />
          {mode === "demo"
            ? "Demo history is stored in this browser only."
            : "History is scoped to your account by row-level security."}
        </p>
        <Link
          href="/analyze"
          className="text-[11px] font-medium text-accent hover:underline"
        >
          Run another analysis →
        </Link>
      </div>
    </div>
  );
}
