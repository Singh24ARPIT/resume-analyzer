"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Download, Loader2, Printer, Trash2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { deleteLocalAnalysis } from "@/lib/demo/local";
import { downloadTextFile } from "@/lib/export/docx";
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

export function DownloadReportButton({ href }: { href: string }) {
  return (
    <a
      href={href}
      className={cn(buttonVariants({ variant: "outline", size: "default" }), "print:hidden")}
      download
    >
      <Download className="size-4" />
      Export JSON
    </a>
  );
}

export function DownloadLocalReportButton({
  result,
}: {
  result: AnalysisResult;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        downloadTextFile({
          fileName: `rolefit-report-${result.id}.json`,
          text: JSON.stringify(result, null, 2),
        })
      }
      className={cn(
        buttonVariants({ variant: "outline", size: "default" }),
        "print:hidden",
      )}
    >
      <Download className="size-4" />
      Export JSON
    </button>
  );
}

export function DeleteAnalysisButton({
  id,
  mode,
}: {
  id: string;
  mode: "demo" | "user";
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    if (
      !window.confirm(
        "Delete this analysis? This removes the report but keeps the resume and job description in your library.",
      )
    ) {
      return;
    }

    setPending(true);
    setError("");

    try {
      if (mode === "demo" || id.startsWith("local-")) {
        deleteLocalAnalysis(id);
      } else {
        const response = await fetch(`/api/analyses/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const data = (await response.json()) as { error?: string };
          setError(data.error ?? "That analysis could not be deleted.");
          return;
        }
      }

      router.push("/history");
      router.refresh();
    } catch {
      setError("That analysis could not be deleted. Try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1 print:hidden">
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className={cn(
          buttonVariants({ variant: "secondary", size: "default" }),
          "text-danger hover:border-danger/30 hover:bg-danger-soft",
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
        Delete
      </button>
      {error ? (
        <p role="alert" className="max-w-[220px] text-right text-[10px] leading-4 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
