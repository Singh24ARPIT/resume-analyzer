import Link from "next/link";
import { FileQuestion } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function AnalysisNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong bg-surface/60 px-6 py-24 text-center">
      <div className="flex size-12 items-center justify-center rounded-2xl border border-border bg-surface text-muted">
        <FileQuestion className="size-5" />
      </div>
      <h1 className="mt-4 text-lg font-semibold">Report not found</h1>
      <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
        This analysis may have been deleted, or it belongs to a different
        workspace.
      </p>
      <div className="mt-5 flex gap-2">
        <Link href="/analyze" className={buttonVariants({ variant: "accent", size: "sm" })}>
          Run a new analysis
        </Link>
        <Link href="/dashboard" className={buttonVariants({ variant: "secondary", size: "sm" })}>
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}
