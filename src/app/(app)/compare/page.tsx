import type { Metadata } from "next";
import { PageHeader } from "@/components/app/page-header";
import { CompareWorkbench } from "@/components/compare/compare-workbench";
import { requireViewer } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Compare resumes",
  description: "Run two to four resume versions against the same job.",
};

export default async function ComparePage() {
  await requireViewer();

  return (
    <>
      <PageHeader
        eyebrow="Compare"
        title="Which version actually earns the screen?"
        description="Upload two to four versions and score them against the same job description. The difference between a 71 and an 84 is usually a handful of missing requirements."
      />
      <CompareWorkbench />
    </>
  );
}
