import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-warning/15 bg-warning-soft px-4 py-2.5 text-[11px] leading-4 text-warning sm:px-6 lg:px-8">
      <p className="flex items-center gap-2">
        <FlaskConical className="size-3.5 shrink-0" />
        <span>
          <span className="font-semibold">Demo workspace.</span>{" "}
          <span className="hidden sm:inline">
            Analyses and resumes stay in this browser.
          </span>
        </span>
      </p>
      <Link
        href="/login?setup=supabase"
        className="inline-flex shrink-0 items-center gap-1 font-medium underline-offset-4 hover:underline"
      >
        Connect Supabase
        <ArrowRight className="size-3" />
      </Link>
    </div>
  );
}
