import { cn } from "@/lib/utils";

export function ScoreTrend({
  points,
  className,
}: {
  points: Array<{ label: string; score: number }>;
  className?: string;
}) {
  if (points.length < 2) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-xl border border-dashed border-border text-[12px] text-muted">
        Run two analyses to see your trend.
      </div>
    );
  }

  const width = 640;
  const height = 190;
  const padding = { top: 18, right: 18, bottom: 28, left: 28 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const min = Math.max(0, Math.min(...points.map((point) => point.score)) - 8);
  const max = Math.min(100, Math.max(...points.map((point) => point.score)) + 8);
  const range = Math.max(1, max - min);

  const coords = points.map((point, index) => {
    const x =
      padding.left + (index / Math.max(1, points.length - 1)) * chartWidth;
    const y =
      padding.top + chartHeight - ((point.score - min) / range) * chartHeight;
    return { ...point, x, y };
  });

  const line = coords
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const area = `${line} L ${coords[coords.length - 1].x} ${padding.top + chartHeight} L ${coords[0].x} ${padding.top + chartHeight} Z`;
  const last = coords[coords.length - 1];

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Match score trend"
        className="h-auto w-full overflow-visible"
      >
        <defs>
          <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.22" />
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0, 0.33, 0.66, 1].map((ratio) => {
          const y = padding.top + chartHeight * ratio;
          return (
            <line
              key={ratio}
              x1={padding.left}
              x2={width - padding.right}
              y1={y}
              y2={y}
              stroke="var(--border)"
              strokeDasharray="3 5"
              strokeWidth="1"
            />
          );
        })}

        <path d={area} fill="url(#trend-fill)" />
        <path
          d={line}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {coords.map((point) => (
          <g key={`${point.label}-${point.x}`}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="var(--surface)"
              stroke="var(--accent)"
              strokeWidth="2"
            />
            <text
              x={point.x}
              y={height - 8}
              textAnchor="middle"
              fontSize="9"
              fill="var(--muted)"
            >
              {point.label}
            </text>
          </g>
        ))}

        <circle cx={last.x} cy={last.y} r="6" fill="var(--accent)" opacity="0.2" />
        <circle cx={last.x} cy={last.y} r="3.5" fill="var(--accent)" />
        <text
          x={last.x}
          y={last.y - 12}
          textAnchor="end"
          fontSize="11"
          fontWeight="600"
          fill="var(--accent)"
        >
          {last.score}
        </text>
      </svg>
    </div>
  );
}
