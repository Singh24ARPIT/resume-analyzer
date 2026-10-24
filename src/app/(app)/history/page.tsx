import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { HistoryView } from "@/components/history/history-view";
import { buttonVariants } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth";
import { getAnalysisSummaries } from "@/lib/data/library";

export const metadata: Metadata = {
  title: "History",
  description: "Every analysis in your workspace.",
};

export default async function HistoryPage() {
  const viewer = await requireViewer();
  const analyses = await getAnalysisSummaries(viewer);

  return (
    <>
      <PageHeader
        eyebrow="History"
        title="Every version, every role."
        description="Search past analyses, spot the score trend, and reopen the report that explains each result."
        actions={
          <Link
            href="/analyze"
            className={buttonVariants({ variant: "accent", size: "default" })}
          >
            <Plus className="size-4" />
            New analysis
          </Link>
        }
      />
      <HistoryView mode={viewer.type} initialAnalyses={analyses} />
    </>
  );
}
