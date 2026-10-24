"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, HardDrive, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { listLocalAnalyses } from "@/lib/demo/local";
import type { AnalysisResult } from "@/lib/types";
import { cn, formatRelativeDate } from "@/lib/utils";

function scoreClass(score: number) {
  if (score >= 70) return "border-success/20 bg-success-soft text-success";
  if (score >= 55) return "border-accent/20 bg-accent-soft text-accent";
  return "border-danger/20 bg-danger-soft text-danger";
}

export function LocalAnalysesPanel() {
  const [analyses, setAnalyses] = useState<AnalysisResult[] | null>(null);

  useEffect(() => {
    setAnalyses(listLocalAnalyses());
    const refresh = () => setAnalyses(listLocalAnalyses());
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, []);

  const stats = useMemo(() => {
    if (!analyses?.length) return null;
    const scores = analyses.map((analysis) => analysis.overallScore);
    return {
      total: analyses.length,
      average: Math.round(
        scores.reduce((sum, score) => sum + score, 0) / scores.length,
      ),
      best: Math.max(...scores),
    };
  }, [analyses]);

  if (analyses === null) {
    return (
      <div className="mt-4 h-[92px] animate-pulse rounded-2xl border border-border bg-surface" />
    );
  }

  if (analyses.length === 0) {
    return (
      <Card className="mt-4 border-dashed">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted">
              <HardDrive className="size-4" />
            </span>
            <div>
              <p className="text-[12px] font-medium">
                No browser-saved analyses yet
              </p>
              <p className="mt-0.5 max-w-xl text-[10px] leading-5 text-muted">
                Analyses you run in the demo are saved in this browser. They
                appear here and in your history without touching a server.
              </p>
            </div>
          </div>
          <Link
            href="/analyze"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-[10px] font-medium text-white transition-opacity hover:opacity-90"
          >
            <Plus className="size-3" />
            Run one now
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4 overflow-hidden border-accent/25">
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 border-b border-border bg-accent-soft/40 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-lg border border-accent/20 bg-surface text-accent">
            <HardDrive className="size-3.5" />
          </span>
          <div>
            <p className="text-[12px] font-semibold">Saved in this browser</p>
            <p className="text-[10px] text-muted">
              {stats?.total} demo {stats?.total === 1 ? "analysis" : "analyses"} ·
              average {stats?.average}/100 · best {stats?.best}/100
            </p>
          </div>
          <Badge variant="accent" className="ml-1 hidden sm:inline-flex">
            <Sparkles className="size-3" />
            Local only
          </Badge>
        </div>
        <Link
          href="/history"
          className="flex items-center gap-1 text-[10px] font-medium text-accent hover:underline"
        >
          Full history <ArrowRight className="size-3" />
        </Link>
      </CardHeader>
      <div className="divide-y divide-border">
        {analyses.slice(0, 4).map((analysis) => (
          <Link
            key={analysis.id}
            href={`/analyses/${analysis.id}`}
            className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2 sm:px-5"
          >
            <span
              className={cn(
                "flex size-8 shrink-0 items-center justify-center rounded-lg border font-mono text-[11px] font-semibold",
                scoreClass(analysis.overallScore),
              )}
            >
              {analysis.overallScore}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[12px] font-medium">
                {analysis.job.title}
              </span>
              <span className="block truncate text-[10px] text-muted">
                {analysis.job.company} · {analysis.resume.title}
              </span>
            </span>
            <span className="hidden shrink-0 text-[10px] text-muted sm:block">
              {formatRelativeDate(analysis.createdAt)}
            </span>
            <ArrowRight className="size-3.5 shrink-0 text-border-strong transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
          </Link>
        ))}
      </div>
    </Card>
  );
}
