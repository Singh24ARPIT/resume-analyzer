import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, FlaskConical } from "lucide-react";
import { AnalysisReport } from "@/components/report/analysis-report";
import { PrintButton } from "@/components/report/report-actions";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { sampleAnalysis } from "@/lib/sample-report";

export const metadata: Metadata = {
  title: "Sample report",
  description:
    "See what Resume Analyzer produces: explainable scores, skill gaps, ATS checks, and grounded rewrites.",
};

export default function SampleReportPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        <div className="container-page py-8 sm:py-10">
          <div className="flex flex-col gap-5 pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Badge variant="accent">
                <FlaskConical className="size-3" />
                Sample report
              </Badge>
              <h1 className="mt-3 text-[30px] font-semibold leading-tight tracking-[-0.04em] sm:text-[36px]">
                Senior Frontend Engineer
              </h1>
              <p className="mt-1 text-sm text-muted">
                Lumen Labs · Remote · A complete report with fictional data
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <Link
                href="/"
                className={buttonVariants({ variant: "secondary", size: "default" })}
              >
                <ArrowLeft className="size-4" />
                Home
              </Link>
              <PrintButton />
              <Link
                href="/analyze"
                className={buttonVariants({ variant: "accent", size: "default" })}
              >
                Analyze mine
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          <AnalysisReport result={sampleAnalysis} />

          <div className="mt-6 flex flex-col justify-between gap-4 rounded-2xl border border-border bg-surface p-5 sm:flex-row sm:items-center sm:p-6">
            <div>
              <p className="text-[13px] font-medium">Ready to see your own gaps?</p>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Upload a PDF or DOCX resume and paste the job description. No
                account needed, and nothing is stored.
              </p>
            </div>
            <Link
              href="/analyze"
              className={buttonVariants({ variant: "accent", size: "default" })}
            >
              Run my analysis
              <ArrowRight className="size-4" />
            </Link>
          </div>

          <p className="mt-5 text-[10px] leading-5 text-muted">
            This is a product demonstration. Resumes, companies, and metrics are
            fictional. In a real report, every claim comes from the uploaded
            resume; the AI is instructed not to invent experience.
          </p>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
