import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GitCompareArrows,
  Plus,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
} from "lucide-react";
import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { ScoreTrend } from "@/components/app/score-trend";
import { LocalAnalysesPanel } from "@/components/dashboard/local-analyses-panel";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { requireViewer } from "@/lib/auth";
import { getDashboardData } from "@/lib/data/dashboard";
import { cn, formatRelativeDate, scoreBand } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your resume matching overview.",
};

function scorePillClass(score: number) {
  if (score >= 70) return "bg-success-soft text-success border-success/15";
  if (score >= 55) return "bg-accent-soft text-accent border-accent/15";
  return "bg-danger-soft text-danger border-danger/15";
}

export default async function DashboardPage() {
  const viewer = await requireViewer();
  const data = await getDashboardData(viewer);
  const firstName = viewer.name.split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const latest = data.recent[0];

  return (
    <>
      <PageHeader
        eyebrow={data.isDemo ? "Demo workspace" : "Workspace overview"}
        title={`${greeting}, ${firstName}.`}
        description="Here's how your resumes are tracking against the roles you actually care about."
        actions={
          <Link
            href="/analyze"
            className={cn(buttonVariants({ variant: "accent" }), "w-full sm:w-auto")}
          >
            <Plus className="size-4" />
            New analysis
          </Link>
        }
      />

      {data.error ? (
        <div className="mb-6 rounded-xl border border-danger/20 bg-danger-soft px-4 py-3 text-[13px] text-danger">
          We couldn&apos;t load your workspace. Check that the Supabase migration
          has been applied, then refresh.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BarChart3}
          label="Total analyses"
          value={String(data.stats.totalAnalyses)}
          hint={data.isDemo ? "Demo data" : "Across your workspace"}
          tone="accent"
        />
        <StatCard
          icon={Target}
          label="Average match"
          value={data.stats.totalAnalyses ? `${data.stats.averageScore}` : "—"}
          suffix={data.stats.totalAnalyses ? "/100" : undefined}
          hint={data.stats.averageScore >= 70 ? "Above the 70 threshold" : "Room to improve"}
          tone="success"
        />
        <StatCard
          icon={TrendingUp}
          label="Best match"
          value={data.stats.totalAnalyses ? `${data.stats.bestScore}` : "—"}
          suffix={data.stats.totalAnalyses ? "/100" : undefined}
          hint={data.stats.bestScore >= 85 ? "Excellent fit found" : "Keep iterating"}
          tone="lime"
        />
        <StatCard
          icon={FileText}
          label="Saved resumes"
          value={String(data.stats.resumeCount)}
          hint="Private to your account"
          tone="neutral"
        />
      </div>

      {data.isDemo ? <LocalAnalysesPanel /> : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-2">
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
                  Match score trend
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  Weighted score across your recent analyses
                </p>
              </div>
              <Badge variant="outline" className="shrink-0">
                Last {data.trend.length || 0}
              </Badge>
            </CardHeader>
            <CardContent>
              <ScoreTrend points={data.trend} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <h2 className="text-[15px] font-semibold tracking-[-0.01em]">
                  Recent analyses
                </h2>
                <p className="mt-0.5 text-[11px] text-muted">
                  Open a report to see the evidence and rewrites
                </p>
              </div>
              <Link
                href="/analyze"
                className="hidden items-center gap-1 text-[11px] font-medium text-accent hover:underline sm:flex"
              >
                New <ArrowUpRight className="size-3" />
              </Link>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-0">
              {data.recent.length === 0 ? (
                <div className="px-5 pb-6 sm:px-6">
                  <EmptyState
                    icon={Sparkles}
                    title="No analyses yet"
                    description="Add a resume and a job description to see your first match report."
                    action={
                      <Link href="/analyze" className={buttonVariants({ variant: "accent", size: "sm" })}>
                        Run your first analysis
                      </Link>
                    }
                    className="py-10"
                  />
                </div>
              ) : (
                <div className="divide-y divide-border border-t border-border">
                  {data.recent.map((analysis) => (
                    <Link
                      key={analysis.id}
                      href={`/analyses/${analysis.id}`}
                      className="group flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2 sm:px-6"
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg border font-mono text-[12px] font-semibold",
                          scorePillClass(analysis.overallScore),
                        )}
                      >
                        {analysis.overallScore}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium">
                          {analysis.jobTitle}
                        </p>
                        <p className="truncate text-[11px] text-muted">
                          {analysis.company} · {analysis.resumeTitle}
                        </p>
                      </div>
                      <span className="hidden shrink-0 text-[10px] text-muted sm:block">
                        {formatRelativeDate(analysis.createdAt)}
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-border-strong transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {latest ? (
            <Card className="overflow-hidden">
              <div className="border-b border-border bg-surface-2 px-5 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-muted">
                    Latest report
                  </p>
                  <Badge variant={latest.overallScore >= 70 ? "success" : "accent"}>
                    {scoreBand(latest.overallScore).label}
                  </Badge>
                </div>
                <p className="mt-2 text-[14px] font-semibold">{latest.jobTitle}</p>
                <p className="text-[11px] text-muted">{latest.company}</p>
              </div>
              <CardContent className="pt-4">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-mono text-[34px] font-semibold leading-none tracking-[-0.06em]">
                      {latest.overallScore}
                      <span className="ml-1 text-[12px] font-normal text-muted">/100</span>
                    </p>
                    <p className="mt-1 text-[11px] text-muted">Overall match</p>
                  </div>
                  <Link
                    href={`/analyses/${latest.id}`}
                    className="flex items-center gap-1 text-[11px] font-medium text-accent hover:underline"
                  >
                    Open <ArrowUpRight className="size-3" />
                  </Link>
                </div>

                {data.topGaps.length > 0 ? (
                  <div className="mt-5 border-t border-border pt-4">
                    <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-muted">
                      Priority gaps
                    </p>
                    <ul className="mt-2.5 space-y-2.5">
                      {data.topGaps.map((gap) => (
                        <li key={gap.title} className="flex items-start gap-2">
                          <span
                            className={cn(
                              "mt-1 size-1.5 shrink-0 rounded-full",
                              gap.severity === "high"
                                ? "bg-danger"
                                : gap.severity === "medium"
                                  ? "bg-warning"
                                  : "bg-muted",
                            )}
                          />
                          <div>
                            <p className="text-[11px] font-medium leading-4">{gap.title}</p>
                            <p className="mt-0.5 line-clamp-2 text-[10px] leading-4 text-muted">
                              {gap.why}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ) : null}

          <Card className="overflow-hidden">
            <div className="relative border-b border-border bg-foreground px-5 py-4 text-background sm:px-6">
              <div
                aria-hidden="true"
                className="absolute -right-4 -top-6 size-24 rounded-full bg-lime/15 blur-2xl"
              />
              <p className="relative flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.16em] text-background/50">
                <Sparkles className="size-3 text-lime" />
                Quick actions
              </p>
            </div>
            <div className="divide-y divide-border">
              <QuickAction
                href="/analyze"
                icon={Plus}
                title="Run a new analysis"
                subtitle="Resume + job description"
              />
              <QuickAction
                href="/resumes"
                icon={Upload}
                title="Manage resumes"
                subtitle={`${data.stats.resumeCount} saved`}
              />
              <QuickAction
                href="/compare"
                icon={GitCompareArrows}
                title="Compare versions"
                subtitle="2–4 resumes, one role"
              />
              <QuickAction
                href="/jobs"
                icon={BriefcaseBusiness}
                title="Job descriptions"
                subtitle="Saved roles and imports"
              />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  hint,
  tone,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  suffix?: string;
  hint: string;
  tone: "accent" | "success" | "lime" | "neutral";
}) {
  const toneClass = {
    accent: "bg-accent-soft text-accent",
    success: "bg-success-soft text-success",
    lime: "bg-lime/30 text-foreground",
    neutral: "bg-surface-2 text-muted-strong",
  }[tone];

  return (
    <div className="rounded-2xl border border-border bg-surface p-4 card-shadow sm:p-5">
      <div className="flex items-center justify-between">
        <span className={cn("flex size-8 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-[11px] text-muted">{label}</p>
      <p className="mt-0.5 font-mono text-[28px] font-semibold leading-none tracking-[-0.05em]">
        {value}
        {suffix ? (
          <span className="ml-1 text-[11px] font-normal text-muted">{suffix}</span>
        ) : null}
      </p>
      <p className="mt-2 text-[10px] text-muted">{hint}</p>
    </div>
  );
}

function QuickAction({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string;
  icon: typeof Plus;
  title: string;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 px-5 py-3 transition-colors hover:bg-surface-2 sm:px-6"
    >
      <span className="flex size-7 items-center justify-center rounded-lg border border-border bg-surface-2 text-muted-strong">
        <Icon className="size-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-medium">{title}</span>
        <span className="block text-[10px] text-muted">{subtitle}</span>
      </span>
      <ArrowRight className="size-3.5 text-border-strong transition-all group-hover:translate-x-0.5 group-hover:text-foreground" />
    </Link>
  );
}
