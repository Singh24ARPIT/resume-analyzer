"use client";

import { Download, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { downloadTextFile } from "@/lib/export/download";
import type { AnalysisResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function PrintButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className={cn(
        buttonVariants({ variant: "secondary", size: "default" }),
        "print:hidden",
        className,
      )}
    >
      <Printer className="size-4" />
      Print / save PDF
    </button>
  );
}

export function ExportJsonButton({
  result,
  className,
}: {
  result: AnalysisResult;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        downloadTextFile({
          fileName: `resume-analyzer-report-${result.id}.json`,
          text: JSON.stringify(result, null, 2),
        })
      }
      className={cn(
        buttonVariants({ variant: "outline", size: "default" }),
        "print:hidden",
        className,
      )}
    >
      <Download className="size-4" />
      Export JSON
    </button>
  );
}
