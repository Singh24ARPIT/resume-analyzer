import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, PenLine, Plus } from "lucide-react";
import { AnalysisReport } from "@/components/report/analysis-report";
import { LocalAnalysisView } from "@/components/report/local-analysis-view";
import {
  DeleteAnalysisButton,
  DownloadReportButton,
  PrintButton,
} from "@/components/report/report-actions";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth";
import { getAnalysisById } from "@/lib/data/analyses";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Analysis report",
};

type Props = { params: Promise<{ id: string }> };

export default async function AnalysisPage({ params }: Props) {
  const { id } = await params;
  const viewer = await requireViewer();

  if (id.startsWith("local-")) {
    return <LocalAnalysisView id={id} />;
  }

  const result = await getAnalysisById(id, viewer);
  if (!result) notFound();

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
            <Badge variant="accent">Report</Badge>
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
          <DownloadReportButton href={`/api/analyses/${result.id}`} />
          <DeleteAnalysisButton id={result.id} mode="user" />
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

      <AnalysisReport result={result} />
    </div>
  );
}
