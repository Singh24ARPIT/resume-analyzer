import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  CheckCircle2,
  Database,
  EyeOff,
  FileCheck2,
  FileText,
  Gauge,
  GitCompareArrows,
  Layers,
  LockKeyhole,
  PenLine,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  Wand2,
  X,
  Zap,
} from "lucide-react";
import { HeroPreview } from "@/components/marketing/hero-preview";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const stats = [
  ["6", "weighted signals"],
  ["200+", "skill aliases normalized"],
  ["8", "ATS checks"],
  ["~30s", "to a full report"],
];

const scoreRows = [
  ["Must-have skills", 35, "Required skills found and evidenced"],
  ["Relevant experience", 20, "Years, seniority, and recency"],
  ["Semantic fit", 15, "Embedding similarity to the role"],
  ["Preferred skills", 10, "Nice-to-have coverage"],
  ["ATS readiness", 10, "Format and parseability"],
  ["Impact & clarity", 10, "Metrics, action verbs, readability"],
];

const atsChecks = [
  ["Text layer detected", true],
  ["Standard section headers", true],
  ["Contact details present", true],
  ["Quantified achievements", false],
  ["Action-verb bullet starts", true],
  ["No keyword stuffing", true],
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteNav />

      <main>
        <section className="relative overflow-hidden">
          <div
            aria-hidden="true"
            className="grid-noise pointer-events-none absolute inset-0 opacity-70 mask-fade-b"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-40 right-[-10%] size-[560px] rounded-full bg-accent/10 blur-3xl"
          />

          <div className="container-page relative grid gap-14 py-16 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:gap-10 lg:py-24">
            <div className="max-w-[620px]">
              <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-surface/70 px-3 py-1.5 text-[11px] text-muted-strong backdrop-blur">
                <span className="flex size-4 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <Sparkles className="size-2.5" />
                </span>
                AI resume analysis
                <span className="h-3 w-px bg-border" />
                <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-muted">
                  Explainable by design
                </span>
              </div>

              <h1 className="animate-rise-delay-1 mt-6 text-[44px] font-semibold leading-[0.98] tracking-[-0.055em] text-balance sm:text-[58px] lg:text-[64px]">
                Make every resume{" "}
                <span className="relative inline-block whitespace-nowrap">
                  fit the role.
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 300 12"
                    preserveAspectRatio="none"
                    className="absolute -bottom-1.5 left-0 h-2.5 w-full text-accent"
                  >
                    <path
                      d="M3 8.5C69 2.5 201 2 297 6.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </h1>

              <p className="animate-rise-delay-2 mt-6 max-w-lg text-[15px] leading-7 text-muted sm:text-base">
                Upload a resume, paste the job description, and get an
                explainable match score with the exact skills, keywords, and
                bullet rewrites that move the needle. No black-box verdicts.
              </p>

              <div className="animate-rise-delay-3 mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/analyze"
                  className={cn(buttonVariants({ variant: "accent", size: "lg" }), "group")}
                >
                  Analyze my resume
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  href="/sample"
                  className={buttonVariants({ variant: "secondary", size: "lg" })}
                >
                  <FileText className="size-4" />
                  See a sample report
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-muted">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="size-3.5 text-success" />
                  No credit card
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-success" />
                  Private by default
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="size-3.5 text-accent" />
                  Gemini-powered feedback
                </span>
              </div>
            </div>

            <HeroPreview />
          </div>

          <div className="container-page relative pb-14">
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-4">
              {stats.map(([value, label]) => (
                <div key={label} className="bg-surface px-5 py-4">
                  <p className="font-mono text-[19px] font-medium tracking-[-0.04em]">
                    {value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="product" className="border-t border-border bg-surface/45 py-20 lg:py-24">
          <div className="container-page">
            <div className="max-w-2xl">
              <Badge variant="outline" className="font-mono uppercase tracking-[0.14em]">
                The product
              </Badge>
              <h2 className="mt-4 text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-[42px]">
                Everything between “I applied” and “I got the interview.”
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
                One workspace for the job description, the resume, the score,
                and the fixes — so you are not stitching together five tools and
                a spreadsheet.
              </p>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                className="lg:col-span-2"
                icon={Gauge}
                title="An explainable match score"
                description="Six weighted signals, all visible. Expand any component to see the evidence behind it and what would raise it."
              >
                <div className="mt-5 rounded-xl border border-border bg-surface-2 p-3.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium">Overall match</span>
                    <span className="font-mono text-success">84 / 100</span>
                  </div>
                  <Progress value={84} tone="success" className="mt-2 h-2.5" />
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {[
                      ["Skills", 92],
                      ["Experience", 78],
                      ["ATS", 88],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <div className="flex justify-between text-[9px] text-muted">
                          <span>{label}</span>
                          <span className="font-mono">{value}</span>
                        </div>
                        <Progress value={Number(value)} className="mt-1 h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>
              </FeatureCard>

              <FeatureCard
                icon={Target}
                title="A skill gap map"
                description="Aliases are normalized before matching, so React.js, ReactJS, and React all count the same."
              >
                <div className="mt-5 space-y-2.5">
                  <SkillRow label="Matched" tone="success" skills={["React", "TypeScript", "Next.js"]} />
                  <SkillRow label="Missing" tone="danger" skills={["GraphQL", "Playwright"]} />
                  <SkillRow label="Bonus" tone="accent" skills={["Figma", "Storybook"]} />
                </div>
              </FeatureCard>

              <FeatureCard
                icon={FileCheck2}
                title="ATS readiness checks"
                description="Catch the boring failures before a parser does — missing text layers, odd headers, unquantified bullets."
              >
                <ul className="mt-5 space-y-2">
                  {atsChecks.map(([label, passed]) => (
                    <li key={String(label)} className="flex items-center gap-2 text-[11px]">
                      {passed ? (
                        <Check className="size-3.5 shrink-0 text-success" />
                      ) : (
                        <X className="size-3.5 shrink-0 text-danger" />
                      )}
                      <span className={passed ? "text-muted-strong" : "text-danger"}>
                        {label}
                      </span>
                    </li>
                  ))}
                </ul>
              </FeatureCard>

              <FeatureCard
                icon={Wand2}
                title="Bullet rewrites that stay true"
                description="The model is instructed to preserve facts — it sharpens the language and surfaces the metric you already earned."
              >
                <div className="mt-5 rounded-xl border border-border bg-surface-2 p-3.5">
                  <p className="text-[10px] leading-4 text-muted line-through decoration-danger/40">
                    Worked on the dashboard and improved performance.
                  </p>
                  <p className="mt-2 text-[10px] leading-4">
                    Rebuilt the analytics dashboard, cutting time-to-first-chart
                    by <span className="font-semibold">42%</span>.
                  </p>
                  <span className="mt-2 inline-flex items-center gap-1 text-[9px] text-success">
                    <Sparkles className="size-3" /> +12 match points
                  </span>
                </div>
              </FeatureCard>

              <FeatureCard
                icon={GitCompareArrows}
                title="Compare resume versions"
                description="Run two to four resumes against the same job and see which one actually earns the screen."
              >
                <div className="mt-5 space-y-2">
                  {[
                    ["resume_v3.pdf", 84, "Best fit"],
                    ["resume_v2.pdf", 76, ""],
                    ["resume_short.pdf", 69, ""],
                  ].map(([name, score, tag]) => (
                    <div key={String(name)} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-2.5 py-2 text-[10px]">
                      <FileText className="size-3.5 text-muted" />
                      <span className="flex-1 truncate">{name}</span>
                      {tag ? <Badge variant="success" className="px-1.5 py-0.5 text-[8px]">{tag}</Badge> : null}
                      <span className="font-mono font-medium">{score}</span>
                    </div>
                  ))}
                </div>
              </FeatureCard>

              <FeatureCard
                icon={PenLine}
                title="Cover letters on demand"
                description="A grounded first draft from the same resume and job context. Edit it, then export to DOCX."
              >
                <div className="mt-5 rounded-xl border border-border bg-surface-2 p-3.5">
                  <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
                    Dear hiring team,
                  </p>
                  <p className="mt-2 text-[10px] leading-4 text-muted-strong">
                    I have spent the last four years shipping design-system-led
                    React applications. Lumen&apos;s work on…
                  </p>
                  <div className="mt-2 flex gap-1">
                    <span className="h-1 w-12 rounded-full bg-border" />
                    <span className="h-1 w-8 rounded-full bg-border" />
                    <span className="h-1 w-16 rounded-full bg-border" />
                  </div>
                </div>
              </FeatureCard>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 lg:py-24">
          <div className="container-page">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
              <div>
                <Badge variant="outline" className="font-mono uppercase tracking-[0.14em]">
                  How it works
                </Badge>
                <h2 className="mt-4 text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-[42px]">
                  Three steps. One honest answer.
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                  No resume builder lock-in, no vague “AI score.” Just a
                  transparent read of how close you are, and a path to closer.
                </p>
                <div className="mt-7 inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-3.5 py-2.5 text-[11px] text-muted">
                  <LockKeyhole className="size-3.5 text-success" />
                  Files live in a private, per-user storage bucket.
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    number: "01",
                    icon: Layers,
                    title: "Add the two documents",
                    copy: "Upload a PDF or DOCX resume. Paste the job description or import it from a URL.",
                  },
                  {
                    number: "02",
                    icon: ScanSearch,
                    title: "Run the hybrid analysis",
                    copy: "A deterministic engine scores six signals. Gemini reads the context, writes the feedback, and proposes grounded rewrites.",
                  },
                  {
                    number: "03",
                    icon: BarChart3,
                    title: "Fix, re-run, compare",
                    copy: "Edit the resume, analyze again, and compare versions side by side to see what actually improved.",
                  },
                ].map((step) => (
                  <div
                    key={step.number}
                    className="group flex gap-4 rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-strong">
                      <step.icon className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] tracking-[0.14em] text-accent">
                          {step.number}
                        </span>
                        <h3 className="text-[14px] font-semibold">{step.title}</h3>
                      </div>
                      <p className="mt-1 text-[12px] leading-5 text-muted">
                        {step.copy}
                      </p>
                    </div>
                    <ArrowRight className="mt-2 size-4 shrink-0 text-border-strong transition-transform group-hover:translate-x-0.5 group-hover:text-muted" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="scoring" className="py-6">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-[28px] bg-foreground px-6 py-10 text-background sm:px-10 lg:px-14 lg:py-14">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border border-background/10"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute right-20 top-10 size-40 rounded-full bg-lime/10 blur-3xl"
              />

              <div className="relative grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-background/50">
                    The scoring model
                  </p>
                  <h2 className="mt-4 text-[30px] font-semibold leading-[1.1] tracking-[-0.045em] sm:text-[38px]">
                    The score is deterministic.
                    <br />
                    The prose is generative.
                  </h2>
                  <p className="mt-4 max-w-sm text-[13px] leading-6 text-background/55">
                    Language models are great at writing feedback and terrible
                    at consistent arithmetic. So we split the job: our engine
                    owns the number and shows its work; Gemini owns the advice.
                  </p>
                  <div className="mt-7 flex items-center gap-2 text-[11px] text-background/60">
                    <BadgeCheck className="size-4 text-lime" />
                    Same inputs produce the same score.
                  </div>
                </div>

                <div className="rounded-2xl border border-background/10 bg-background/[0.04] p-4 backdrop-blur sm:p-5">
                  <div className="mb-3 flex items-center justify-between text-[10px] text-background/45">
                    <span>Component</span>
                    <span className="font-mono">Weight</span>
                  </div>
                  <div className="space-y-3">
                    {scoreRows.map(([label, weight, helper]) => (
                      <div key={String(label)}>
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-[12px] font-medium">{label}</span>
                          <span className="font-mono text-[11px] text-background/60">
                            {weight} pts
                          </span>
                        </div>
                        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-background/10">
                          <div
                            className="h-full rounded-full bg-lime"
                            style={{ width: `${(Number(weight) / 35) * 100}%` }}
                          />
                        </div>
                        <p className="mt-1 text-[9px] text-background/35">{helper}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="privacy" className="py-20 lg:py-24">
          <div className="container-page grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
            <div>
              <Badge variant="outline" className="font-mono uppercase tracking-[0.14em]">
                Privacy
              </Badge>
              <h2 className="mt-4 text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-[42px]">
                Your resume is not content. It is your career.
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-muted">
                We treat it that way. Rolefit is account-first, private by
                default, and built so you can leave with your data — or delete
                all of it — whenever you want.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  {
                    icon: Database,
                    title: "Private storage",
                    copy: "Files are scoped to your user with row-level security.",
                  },
                  {
                    icon: EyeOff,
                    title: "Redacted before AI",
                    copy: "Contact details are stripped before any model call.",
                  },
                  {
                    icon: Trash2,
                    title: "Delete anytime",
                    copy: "One action removes your files, analyses, and letters.",
                  },
                  {
                    icon: ShieldCheck,
                    title: "No training on your data",
                    copy: "Paid-tier model calls are not used for training.",
                  },
                ].map(({ icon: Icon, title, copy }) => (
                  <div key={title} className="rounded-xl border border-border bg-surface p-4">
                    <Icon className="size-4 text-success" />
                    <p className="mt-2 text-[12px] font-medium">{title}</p>
                    <p className="mt-1 text-[11px] leading-5 text-muted">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-border bg-surface p-5 card-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-8 items-center justify-center rounded-lg bg-success-soft text-success">
                      <ShieldCheck className="size-4" />
                    </span>
                    <div>
                      <p className="text-[12px] font-medium">Privacy checklist</p>
                      <p className="text-[10px] text-muted">Before a model sees your resume</p>
                    </div>
                  </div>
                  <Badge variant="success">Passed</Badge>
                </div>
                <div className="mt-5 space-y-2.5">
                  {[
                    "Email and phone numbers removed",
                    "Portfolio and social links removed",
                    "Prompt injection markers neutralized",
                    "Resume text truncated to model limits",
                    "API key stays server-side",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-[11px] text-muted-strong">
                      <Check className="size-3.5 text-success" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="mt-5 rounded-xl border border-border bg-surface-2 p-3">
                  <p className="text-[10px] leading-5 text-muted">
                    <span className="font-medium text-muted-strong">Note:</span>{" "}
                    demo mode runs with mock data and never sends your text
                    anywhere. Real analyses call Gemini only after redaction.
                  </p>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-3 hidden rounded-xl border border-border bg-foreground px-3 py-2 text-background card-shadow sm:block">
                <p className="text-[10px]">Row-level security</p>
                <p className="font-mono text-[9px] text-background/50">auth.uid() = user_id</p>
              </div>
            </div>
          </div>
        </section>

        <section className="pb-20 lg:pb-24">
          <div className="container-page">
            <div className="relative overflow-hidden rounded-[28px] border border-border bg-surface px-6 py-12 text-center card-shadow sm:px-10 lg:py-16">
              <div
                aria-hidden="true"
                className="dot-grid pointer-events-none absolute inset-0 opacity-60"
              />
              <div className="relative">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                  Ready when you are
                </p>
                <h2 className="mx-auto mt-3 max-w-2xl text-[32px] font-semibold leading-[1.08] tracking-[-0.045em] text-balance sm:text-[44px]">
                  See the gap. Close the gap. Get the interview.
                </h2>
                <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-muted">
                  Start with a sample report, or bring your own resume and the
                  job you actually want.
                </p>
                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    href="/analyze"
                    className={buttonVariants({ variant: "accent", size: "lg" })}
                  >
                    Analyze my resume
                    <ArrowRight className="size-4" />
                  </Link>
                  <Link
                    href="/sample"
                    className={buttonVariants({ variant: "secondary", size: "lg" })}
                  >
                    View a sample report
                  </Link>
                </div>
                <p className="mt-4 text-[10px] text-muted">
                  Demo mode is free. No key or account needed to look around.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  children,
  className,
}: {
  icon: typeof Gauge;
  title: string;
  description: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-border-strong sm:p-6",
        className,
      )}
    >
      <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-muted-strong">
        <Icon className="size-4" />
      </div>
      <h3 className="mt-4 text-[15px] font-semibold tracking-[-0.01em]">
        {title}
      </h3>
      <p className="mt-1.5 text-[12px] leading-5 text-muted">{description}</p>
      {children}
    </div>
  );
}

function SkillRow({
  label,
  tone,
  skills,
}: {
  label: string;
  tone: "success" | "danger" | "accent";
  skills: string[];
}) {
  const toneClass = {
    success: "border-success/15 bg-success-soft text-success",
    danger: "border-danger/15 bg-danger-soft text-danger",
    accent: "border-accent/15 bg-accent-soft text-accent",
  }[tone];

  return (
    <div>
      <p className="font-mono text-[8px] uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className={cn("rounded-md border px-2 py-1 text-[10px] font-medium", toneClass)}
          >
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
