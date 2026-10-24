import { cn } from "@/lib/utils";

export function ScoreRing({
  score,
  size = 148,
  strokeWidth = 10,
  className,
  label,
  sublabel,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  label?: string;
  sublabel?: string;
}) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  const color =
    clamped >= 70
      ? "var(--success)"
      : clamped >= 55
        ? "var(--accent)"
        : "var(--danger)";

  return (
    <div
      className={cn("relative inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
        aria-hidden="true"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="font-mono text-[30px] font-semibold leading-none tracking-[-0.05em]"
          style={{ color }}
        >
          {clamped}
        </span>
        {label ? (
          <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted">
            {label}
          </span>
        ) : null}
        {sublabel ? (
          <span className="mt-0.5 text-[10px] text-muted">{sublabel}</span>
        ) : null}
      </div>
    </div>
  );
}
