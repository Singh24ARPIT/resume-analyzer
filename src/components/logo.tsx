import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  href = "/",
  showWordmark = true,
  inverted = false,
}: {
  className?: string;
  href?: string | null;
  showWordmark?: boolean;
  inverted?: boolean;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "relative flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-[10px] shadow-sm",
          inverted
            ? "bg-background text-foreground"
            : "bg-foreground text-background",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          className="size-[19px]"
        >
          <path
            d="M5.5 5.2h6.6a4.1 4.1 0 0 1 0 8.2H5.5V5.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <path
            d="M5.5 13.4v5.4l5.4-5.4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
          <circle cx="17.8" cy="17.6" r="1.9" fill="var(--lime)" />
        </svg>
      </span>
      {showWordmark ? (
        <span className="text-[16px] font-semibold tracking-[-0.03em]">
          Resume Analyzer<span className="text-accent">.</span>
        </span>
      ) : null}
    </span>
  );

  if (!href) return content;

  return (
    <Link href={href} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
      {content}
    </Link>
  );
}
