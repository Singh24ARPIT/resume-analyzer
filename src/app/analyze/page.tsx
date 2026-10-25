import type { Metadata } from "next";
import { ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { AnalyzeWorkspace } from "@/components/analyze/analyze-workspace";
import { PageHeader } from "@/components/app/page-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { isAiConfigured } from "@/lib/ai/config";

export const metadata: Metadata = {
  title: "Analyze a resume",
  description:
    "Compare a resume against a job description and get an explainable match report. Nothing is stored.",
};

export default function AnalyzePage() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main className="container-page py-10 lg:py-14">
        <PageHeader
          eyebrow="Analyzer"
          title="See how this resume fits this role."
          description="Add the resume and the job description. The deterministic engine scores six signals, then feedback and rewrites are written on top. The file is parsed in memory and discarded with the request."
        />

        <AnalyzeWorkspace aiConfigured={isAiConfigured()} />

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[
            {
              icon: ShieldCheck,
              title: "No account, no storage",
              copy: "There is no database. The report lives in this tab until you refresh.",
            },
            {
              icon: Sparkles,
              title: "Deterministic score",
              copy: "The same resume and job always produce the same number.",
            },
            {
              icon: Wand2,
              title: "Grounded feedback",
              copy: "Rewrites are instructed to preserve your facts, not invent them.",
            },
          ].map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-xl border border-border bg-surface/60 px-4 py-3"
            >
              <Icon className="size-3.5 text-accent" />
              <p className="mt-2 text-[11px] font-medium">{title}</p>
              <p className="mt-1 text-[10px] leading-5 text-muted">{copy}</p>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
