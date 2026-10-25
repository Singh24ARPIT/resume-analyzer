import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-[1.02fr_1fr]">
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-foreground p-10 text-background lg:flex xl:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "22px 22px",
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 size-[420px] rounded-full border border-background/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-20 size-[380px] rounded-full bg-accent/20 blur-3xl"
        />

        <div className="relative">
          <Logo inverted href="/" />
        </div>

        <div className="relative max-w-md">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-background/50">
            Fit before you apply
          </p>
          <blockquote className="mt-4 text-[34px] font-medium leading-[1.15] tracking-[-0.04em] xl:text-[40px]">
            “Stop guessing why the interview never came.”
          </blockquote>
          <p className="mt-5 max-w-sm text-sm leading-6 text-background/60">
            Resume Analyzer turns a job description into a checklist, scores your resume
            against it, and shows exactly what to fix — before a recruiter ever
            sees it.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 border-t border-background/15 pt-6">
            {[
              ["6", "signals scored"],
              ["200+", "skill aliases"],
              ["1 min", "to a report"],
            ].map(([value, label]) => (
              <div key={label}>
                <p className="font-mono text-xl tracking-[-0.04em]">{value}</p>
                <p className="mt-1 text-[11px] leading-4 text-background/50">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[11px] text-background/45">
          <CheckCircle2 className="size-3.5" />
          Private workspace · no public resumes · delete anytime
        </div>
      </aside>

      <main className="relative flex min-h-screen flex-col">
        <div className="flex items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <div className="lg:hidden">
            <Logo />
          </div>
          <Link
            href="/"
            className="hidden items-center gap-2 text-[12px] font-medium text-muted transition-colors hover:text-foreground lg:flex"
          >
            <ArrowLeft className="size-3.5" />
            Back to home
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-5 pb-16 pt-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-[410px]">{children}</div>
        </div>

        <div className="px-5 pb-6 text-center text-[11px] text-muted sm:px-8 lg:px-12">
          <Link href="/" className="hover:text-foreground lg:hidden">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
