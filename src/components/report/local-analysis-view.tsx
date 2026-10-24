"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, HardDrive, PenLine, Plus } from "lucide-react";
import { AnalysisReport } from "@/components/report/analysis-report";
import {
  DeleteAnalysisButton,
  DownloadLocalReportButton,
  PrintButton,
} from "@/components/report/report-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { loadLocalAnalysis } from "@/lib/demo/local";
import type { AnalysisResult } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function LocalAnalysisView({ id }: { id: string }) {
  const [result, setResult] = useState<AnalysisResult | null | undefined>(undefined);

  useEffect(() => {
    setResult(loadLocalAnalysis(id));
  }, [id]);

  if (result === undefined) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-52 animate-pulse rounded-lg bg-surface-2" />
        <div className="h-[360px] animate-pulse rounded-2xl border border-border bg-surface" />
        <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
          <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-surface" />
          <div className="h-[420px] animate-pulse rounded-2xl border border-border bg-surface" />
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/60 px-6 py-20 text-center">
        <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted">
          <HardDrive className="size-5" />
        </div>
        <h1 className="mt-4 text-lg font-semibold">This local report is missing</h1>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
          Demo analyses live in this browser&apos;s local storage. It may have
          been cleared, or you opened the link on another device.
        </p>
        <div className="mt-5 flex gap-2">
          <Link href="/analyze" className={buttonVariants({ variant: "accent", size: "sm" })}>
            <Plus className="size-3.5" />
            New analysis
          </Link>
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 text-[11px] text-muted print:hidden">
        <Link href="/dashboard" className="transition-colors hover:text-foreground">
          Dashboard
        </Link>
        <span className="text-border-strong">/</span>
        <span>Analysis</span>
      </div>

      <div className="flex flex-col gap-4 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Saved in this browser</Badge>
            <span className="font-mono text-[10px] text-muted">
              {formatDate(result.createdAt)}
            </span>
          </div>
          <h1 className="mt-2 text-[28px] font-semibold leading-tight tracking-[-0.035em] sm:text-[32px]">
            {result.job.title}
          </h1>
          <p className="mt-1 text-sm text-muted">
            {result.job.company} · {result.resume.title}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Link href="/dashboard" className={buttonVariants({ variant: "secondary", size: "sm" })}>
            <ArrowLeft className="size-3.5" />
            Dashboard
          </Link>
          <PrintButton />
          <DownloadLocalReportButton result={result} />
          <DeleteAnalysisButton id={result.id} mode="demo" />
          <Link
            href={`/cover-letters?analysis=${result.id}`}
            className={buttonVariants({ variant: "secondary", size: "default" })}
          >
            <PenLine className="size-4" />
            Cover letter
          </Link>
          <Link href="/analyze" className={buttonVariants({ variant: "accent", size: "default" })}>
            <Plus className="size-4" />
            New analysis
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-warning/20 bg-warning-soft px-3.5 py-2.5 text-[11px] text-warning print:hidden">
        <HardDrive className="size-3.5 shrink-0" />
        This analysis is stored only in this browser. Connect Supabase to keep
        analyses, resumes, and cover letters in your account.
      </div>

      <AnalysisReport result={result} />
    </div>
  );
}
