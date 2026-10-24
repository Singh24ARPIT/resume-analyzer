import { cn } from "@/lib/utils";

type Tone = "accent" | "success" | "warning" | "danger" | "neutral";

const toneClass: Record<Tone, string> = {
  accent: "bg-accent",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  neutral: "bg-muted-strong",
};

export function Progress({
  value,
  tone = "accent",
  className,
  barClassName,
  label,
}: {
  value: number;
  tone?: Tone;
  className?: string;
  barClassName?: string;
  label?: string;
}) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={clamped}
      aria-label={label ?? "Progress"}
      className={cn("h-2 w-full overflow-hidden rounded-full bg-border/70", className)}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-700 ease-out",
          toneClass[tone],
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
