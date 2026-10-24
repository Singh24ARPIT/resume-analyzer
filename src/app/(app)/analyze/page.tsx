import type { Metadata } from "next";
import { AnalyzeForm } from "@/components/analyze/analyze-form";
import { PageHeader } from "@/components/app/page-header";
import { requireViewer } from "@/lib/auth";
import { isAiConfigured } from "@/lib/ai/config";
import { getJobLibrary, getResumeLibrary } from "@/lib/data/library";

export const metadata: Metadata = {
  title: "New analysis",
  description:
    "Compare a resume against a job description and get an explainable match report.",
};

export default async function AnalyzePage({
  searchParams,
}: {
  searchParams: Promise<{ resume?: string; job?: string }>;
}) {
  const viewer = await requireViewer();
  const params = await searchParams;
  const [resumes, jobs] = await Promise.all([
    getResumeLibrary(viewer),
    getJobLibrary(viewer),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="New analysis"
        title="See how this resume fits this role."
        description="Add the resume and the job description. The deterministic engine scores six signals, then feedback and rewrites are written on top."
      />

      <AnalyzeForm
        mode={viewer.type}
        savedResumes={resumes}
        savedJobs={jobs}
        aiConfigured={isAiConfigured()}
        initialResumeId={params.resume}
        initialJobId={params.job}
      />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          {
            title: "Deterministic score",
            copy: "The same resume and job always produce the same number.",
          },
          {
            title: "Grounded feedback",
            copy: "Rewrites are instructed to preserve your facts, not invent them.",
          },
          {
            title: "Private by default",
            copy:
              viewer.type === "demo"
                ? "Demo analyses are stored only in this browser."
                : "Resumes live in a private bucket scoped to your user.",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-border bg-surface/60 px-4 py-3"
          >
            <p className="text-[11px] font-medium">{item.title}</p>
            <p className="mt-1 text-[10px] leading-5 text-muted">{item.copy}</p>
          </div>
        ))}
      </div>
    </>
  );
}
