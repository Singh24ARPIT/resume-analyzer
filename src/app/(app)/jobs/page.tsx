import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { JobLibrary } from "@/components/jobs/job-library";
import { buttonVariants } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth";
import { getJobLibrary } from "@/lib/data/library";

export const metadata: Metadata = {
  title: "Job descriptions",
  description: "Saved job descriptions for repeat analyses.",
};

export default async function JobsPage() {
  const viewer = await requireViewer();
  const jobs = await getJobLibrary(viewer);

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Job descriptions"
        description="Keep the roles you are actually pursuing. A saved description can be reused across resumes, comparisons, and cover letters."
        actions={
          <Link
            href="/analyze"
            className={buttonVariants({ variant: "default", size: "default" })}
          >
            <Plus className="size-4" />
            New analysis
          </Link>
        }
      />

      <JobLibrary mode={viewer.type} initialJobs={jobs} />
    </>
  );
}
