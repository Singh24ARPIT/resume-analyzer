import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Info,
  Lightbulb,
  Quote,
  Sparkles,
  Target,
  X,
  XCircle,
} from "lucide-react";
import type { AnalysisResult, CheckStatus, ScoreKey } from "@/lib/types";
import { CopyButton } from "@/components/report/copy-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScoreRing } from "@/components/ui/score-ring";
import { cn, formatDate, scoreBand } from "@/lib/utils";

const subScoreMeta: Array<{
  key: ScoreKey;
  label: string;
  weight: number;
  hint: string;
}> = [
  { key: "skills", label: "Must-have skills", weight: 35, hint: "Required skill coverage" },
  { key: "experience", label: "Relevant experience", weight: 20, hint: "Years and seniority fit" },
  { key: "semantic", label: "Semantic fit", weight: 15, hint: "Meaning-level similarity" },
  { key: "preferred", label: "Preferred skills", weight: 10, hint: "Nice-to-have coverage" },
  { key: "ats", label: "ATS readiness", weight: 10, hint: "Parser and format checks" },
  { key: "impact", label: "Impact & clarity", weight: 10, hint: "Metrics and action verbs" },
];

function progressTone(value: number) {
  if (value >= 70) return "success" as const;
  if (value >= 55) return "accent" as const;
  if (value >= 40) return "warning" as const;
  return "danger" as const;
}

const statusConfig: Record<
  CheckStatus,
  { icon: typeof Check; className: string; box: string }
> = {
  pass: {
    icon: Check,
    className: "text-success",
    box: "bg-success-soft text-success",
  },
  warn: {
    icon: AlertTriangle,
    className: "text-warning",
    box: "bg-warning-soft text-warning",
  },
  fail: {
    icon: X,
    className: "text-danger",
    box: "bg-danger-soft text-danger",
  },
};

export function AnalysisReport({ result }: { result: AnalysisResult }) {
  const band = scoreBand(result.overallScore);
  const atsPassed = result.ats.filter((check) => check.status === "pass").length;
  const atsWarnings = result.ats.filter((check) => check.status === "warn").length;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden print:break-inside-avoid">
        <div className="flex flex-col gap-6 p-5 sm:p-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex items-center gap-5 lg:flex-col lg:gap-2">
            <ScoreRing
              score={result.overallScore}
              size={150}
              strokeWidth={10}
              label="Overall match"
            />
            <div className="lg:text-center">
              <Badge variant={result.overallScore >= 70 ? "success" : result.overallScore >= 55 ? "accent" : "danger"}>
                {band.label}
              </Badge>
              <p className="mt-2 max-w-[190px] text-[11px] leading-5 text-muted lg:mx-auto">
                {band.description}
              </p>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="dark">{result.job.title}</Badge>
              <span className="text-[11px] text-muted">{result.job.company}</span>
              <span className="text-border-strong">·</span>
              <span className="text-[11px] text-muted">{formatDate(result.createdAt)}</span>
            </div>

            <h2 className="mt-3 text-[20px] font-semibold leading-[1.25] tracking-[-0.035em] text-balance sm:text-[23px]">
              {result.summary}
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
              {subScoreMeta.map((item) => {
                const value = result.scores[item.key];
                return (
                  <div key={item.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-[10px] text-muted">{item.label}</span>
                      <span className="font-mono text-[11px] font-medium">{value}</span>
                    </div>
                    <Progress
                      value={value}
                      tone={progressTone(value)}
                      className="mt-1.5 h-1.5"
                      label={item.label}
                    />
                    <p className="mt-1 text-[9px] text-muted/80">
                      {item.weight}% · {item.hint}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 border-t border-border bg-surface-2 px-5 py-3 text-[10px] text-muted sm:px-6">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-success" />
            {atsPassed}/{result.ats.length} ATS checks passed
          </span>
          {atsWarnings > 0 ? (
            <span className="flex items-center gap-1.5">
              <AlertTriangle className="size-3.5 text-warning" />
              {atsWarnings} warning{atsWarnings === 1 ? "" : "s"}
            </span>
          ) : null}
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.12em]">
            {result.model}
          </span>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <h3 className="flex items-center gap-2 text-[14px] font-semibold">
                  <CheckCircle2 className="size-4 text-success" />
                  What&apos;s working
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.strengths.map((strength) => (
                    <li key={strength} className="flex gap-2.5 text-[12px] leading-5 text-muted-strong">
                      <Check className="mt-0.5 size-3.5 shrink-0 text-success" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <h3 className="flex items-center gap-2 text-[14px] font-semibold">
                  <Target className="size-4 text-accent" />
                  Where to focus
                </h3>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.gaps.slice(0, 3).map((gap) => (
                    <li key={gap.title}>
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-1.5 size-1.5 shrink-0 rounded-full",
                            gap.severity === "high"
                              ? "bg-danger"
                              : gap.severity === "medium"
                                ? "bg-warning"
                                : "bg-muted",
                          )}
                        />
                        <div>
                          <p className="text-[12px] font-medium leading-5">{gap.title}</p>
                          <p className="text-[11px] leading-5 text-muted">{gap.why}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-[14px] font-semibold">
                  <Sparkles className="size-4 text-accent" />
                  Suggested bullet rewrites
                </h3>
                <p className="mt-1 text-[11px] text-muted">
                  Grounded in your resume — no invented experience.
                </p>
              </div>
              <Badge variant="outline">{result.bulletRewrites.length} rewrites</Badge>
            </CardHeader>
            <CardContent className="space-y-3">
              {result.bulletRewrites.map((rewrite, index) => (
                <div
                  key={`${rewrite.original}-${index}`}
                  className="rounded-xl border border-border bg-surface-2 p-3.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
                      Rewrite {String(index + 1).padStart(2, "0")}
                    </span>
                    <CopyButton text={rewrite.improved} label="Copy rewrite" />
                  </div>
                  <p className="mt-2.5 text-[11px] leading-5 text-muted line-through decoration-danger/35">
                    {rewrite.original}
                  </p>
                  <p className="mt-1.5 text-[12px] leading-5 text-foreground">
                    {rewrite.improved}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 border-t border-border pt-2.5">
                    <p className="flex-1 text-[10px] leading-4 text-muted">{rewrite.rationale}</p>
                    {rewrite.keywordsAdded?.length ? (
                      <div className="flex flex-wrap gap-1">
                        {rewrite.keywordsAdded.map((keyword) => (
                          <span
                            key={keyword}
                            className="rounded bg-accent-soft px-1.5 py-0.5 text-[9px] font-medium text-accent"
                          >
                            +{keyword}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h3 className="flex items-center gap-2 text-[14px] font-semibold">
                <Lightbulb className="size-4 text-warning" />
                Section-by-section feedback
              </h3>
            </CardHeader>
            <CardContent className="space-y-4">
              {result.sectionFeedback.map((section) => (
                <div key={section.section}>
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[12px] font-medium">{section.section}</p>
                    <span className="font-mono text-[10px] text-muted">{section.score}/100</span>
                  </div>
                  <Progress
                    value={section.score}
                    tone={progressTone(section.score)}
                    className="mt-1.5 h-1.5"
                    label={section.section}
                  />
                  <p className="mt-1.5 text-[11px] leading-5 text-muted">{section.feedback}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
              <div>
                <h3 className="flex items-center gap-2 text-[14px] font-semibold">
                  <Quote className="size-4 text-accent" />
                  Suggested summary
                </h3>
                <p className="mt-1 text-[11px] text-muted">
                  Re-tuned for the target role. Edit it so it still sounds like you.
                </p>
              </div>
              <CopyButton text={result.suggestedSummary} label="Copy" />
            </CardHeader>
            <CardContent>
              <p className="rounded-xl border border-border bg-surface-2 p-4 text-[12px] leading-6 text-muted-strong">
                {result.suggestedSummary}
              </p>
            </CardContent>
          </Card>

          {result.interviewQuestions.length > 0 ? (
            <Card>
              <CardHeader className="pb-3">
                <h3 className="text-[14px] font-semibold">Questions to prepare for</h3>
                <p className="mt-1 text-[11px] text-muted">
                  Based on the gaps a hiring team is likely to probe.
                </p>
              </CardHeader>
              <CardContent>
                <ol className="space-y-2.5">
                  {result.interviewQuestions.map((question, index) => (
                    <li key={question} className="flex gap-3 text-[12px] leading-5 text-muted-strong">
                      <span className="font-mono text-[10px] text-accent">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {question}
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card id="skills">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-[14px] font-semibold">Skills matrix</h3>
                <Badge variant="success">{result.skills.matched.length} matched</Badge>
              </div>
              <p className="mt-1 text-[11px] text-muted">
                Aliases normalized before matching.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <SkillGroup
                label="Matched"
                skills={result.skills.matched.map((skill) => skill.name)}
                tone="success"
              />
              <SkillGroup
                label="Missing"
                skills={result.skills.missing.map((skill) => skill.name)}
                tone="danger"
              />
              <SkillGroup
                label="Bonus"
                skills={result.skills.bonus.map((skill) => skill.name)}
                tone="accent"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <h3 className="text-[14px] font-semibold">Keyword coverage</h3>
              <p className="mt-1 text-[11px] text-muted">
                Must-have terms the employer is likely scanning for.
              </p>
            </CardHeader>
            <CardContent className="px-0 pb-0 sm:px-0">
              <div className="border-t border-border">
                {result.keywords.map((keyword) => (
                  <div
                    key={keyword.term}
                    className="flex items-center gap-2 border-b border-border px-5 py-2.5 last:border-b-0 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium">{keyword.term}</p>
                      <p className="text-[9px] text-muted">
                        {keyword.importance === "must" ? "Must-have" : "Nice-to-have"}
                      </p>
                    </div>
                    <span className="font-mono text-[9px] text-muted">
                      ×{keyword.count}
                    </span>
                    {keyword.inResume ? (
                      <CheckCircle2 className="size-3.5 text-success" />
                    ) : (
                      <XCircle className="size-3.5 text-danger" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card id="ats">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <h3 className="text-[14px] font-semibold">ATS readiness</h3>
                <p className="mt-1 text-[11px] text-muted">
                  How cleanly a parser can read this resume.
                </p>
              </div>
              <span className="font-mono text-[16px] font-semibold">{result.scores.ats}</span>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {result.ats.map((check) => {
                const config = statusConfig[check.status];
                const Icon = config.icon;
                return (
                  <div key={check.id} className="flex items-start gap-2.5">
                    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md", config.box)}>
                      <Icon className="size-3" />
                    </span>
                    <div>
                      <p className="text-[11px] font-medium leading-5">{check.label}</p>
                      <p className="text-[10px] leading-4 text-muted">{check.detail}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-border bg-surface-2 p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-muted-strong">
              <Info className="size-3.5" />
              How this score was built
            </p>
            <p className="mt-1.5 text-[10px] leading-5 text-muted">
              Six weighted signals produce the overall number. Feedback and
              rewrites are generated separately and never change the score.
              {result.aiFallback
                ? " AI feedback fell back to a local template for this run."
                : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SkillGroup({
  label,
  skills,
  tone,
}: {
  label: string;
  skills: string[];
  tone: "success" | "danger" | "accent";
}) {
  const classes = {
    success: "border-success/15 bg-success-soft text-success",
    danger: "border-danger/15 bg-danger-soft text-danger",
    accent: "border-accent/15 bg-accent-soft text-accent",
  }[tone];

  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-muted">
        {label} · {skills.length}
      </p>
      {skills.length ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {skills.map((skill) => (
            <span
              key={skill}
              className={cn("rounded-md border px-2 py-1 text-[10px] font-medium", classes)}
            >
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1.5 text-[10px] text-muted">None detected.</p>
      )}
    </div>
  );
}
