import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/app/page-header";
import { ResumeLibrary } from "@/components/resumes/resume-library";
import { buttonVariants } from "@/components/ui/button";
import { requireViewer } from "@/lib/auth";
import { getResumeLibrary } from "@/lib/data/library";

export const metadata: Metadata = {
  title: "Resumes",
  description: "Your private resume library.",
};

export default async function ResumesPage() {
  const viewer = await requireViewer();
  const resumes = await getResumeLibrary(viewer);

  return (
    <>
      <PageHeader
        eyebrow="Library"
        title="Your resumes"
        description="One place for the versions you actually send. Reuse a saved resume across analyses, then compare versions against the same job."
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

      <ResumeLibrary
        mode={viewer.type}
        initialResumes={viewer.type === "demo" ? resumes : resumes}
      />
    </>
  );
}
