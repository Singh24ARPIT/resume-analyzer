import {
  ArrowUpRight,
  Check,
  FileSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScoreRing } from "@/components/ui/score-ring";

const signals = [
  { label: "Skills coverage", value: 92, tone: "bg-success" },
  { label: "Experience fit", value: 78, tone: "bg-accent" },
  { label: "ATS readiness", value: 88, tone: "bg-success" },
];

export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[540px]">
      <div
        aria-hidden="true"
        className="absolute -right-10 top-8 size-72 rounded-full bg-accent/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -left-12 bottom-4 size-56 rounded-full bg-lime/25 blur-3xl"
      />

      <div className="relative animate-rise-delay-2 rounded-[24px] border border-border bg-surface p-4 card-shadow sm:p-5 lg:rotate-[1.2deg]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
            <FileSearch className="size-3.5" />
            Analysis / 024
          </div>
          <Badge variant="success">
            <span className="size-1.5 rounded-full bg-success" />
            Strong match
          </Badge>
        </div>

        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] text-muted">Target role</p>
            <h3 className="mt-0.5 text-[19px] font-semibold leading-tight tracking-[-0.03em]">
              Senior Frontend Engineer
            </h3>
            <p className="mt-1 text-[11px] text-muted">Lumen Labs · Remote</p>
          </div>
          <ScoreRing score={84} size={92} strokeWidth={7} label="Match" />
        </div>

        <div className="mt-4 space-y-2.5 rounded-xl border border-border bg-surface-2 p-3.5">
          {signals.map((signal) => (
            <div key={signal.label}>
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-muted">{signal.label}</span>
                <span className="font-mono text-muted-strong">{signal.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${signal.tone}`}
                  style={{ width: `${signal.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3.5 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-success/15 bg-success-soft p-3">
            <p className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.12em] text-success">
              <Check className="size-3" /> Matched
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {["React", "TypeScript", "Next.js", "Design systems"].map(
                (skill) => (
                  <span
                    key={skill}
                    className="rounded-md bg-surface/80 px-1.5 py-1 text-[9px] font-medium text-success"
                  >
                    {skill}
                  </span>
                ),
              )}
            </div>
          </div>
          <div className="rounded-xl border border-danger/15 bg-danger-soft p-3">
            <p className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.12em] text-danger">
              <span className="font-mono">!</span> Missing
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {["GraphQL", "Playwright", "A/B testing"].map((skill) => (
                <span
                  key={skill}
                  className="rounded-md bg-surface/80 px-1.5 py-1 text-[9px] font-medium text-danger"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3.5 rounded-xl border border-border bg-surface p-3.5">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-[10px] font-medium text-muted-strong">
              <Sparkles className="size-3 text-accent" />
              AI bullet rewrite
            </p>
            <span className="font-mono text-[9px] text-success">+12 pts</span>
          </div>
          <p className="mt-2 text-[10px] leading-4 text-muted line-through decoration-danger/40">
            Worked on the dashboard and improved performance.
          </p>
          <p className="mt-1.5 text-[10px] leading-4 text-foreground">
            Rebuilt the analytics dashboard in Next.js, cutting time-to-first-chart
            by <span className="font-semibold">42%</span> for 18k monthly users.
          </p>
        </div>

        <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3 text-[9px] text-muted">
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-success" />
            ATS checks passed · 9/10
          </span>
          <span className="flex items-center gap-1">
            Generated in 24s <ArrowUpRight className="size-3" />
          </span>
        </div>
      </div>

      <div className="absolute -left-5 bottom-20 hidden animate-float-slow rounded-xl border border-border bg-surface px-3 py-2.5 card-shadow sm:block">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
          Skill aliases
        </p>
        <p className="mt-1 text-[11px] font-medium">React.js → React</p>
        <p className="text-[10px] text-success">canonicalized</p>
      </div>

      <div className="absolute -right-4 top-16 hidden rotate-[-2deg] rounded-xl border border-border bg-foreground px-3 py-2.5 text-background card-shadow sm:block">
        <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-background/50">
          Explainable score
        </p>
        <p className="mt-1 text-[12px] font-semibold">6 weighted signals</p>
        <p className="text-[10px] text-background/50">no black box</p>
      </div>
    </div>
  );
}
