import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="container-page py-12">
        <div className="flex flex-col justify-between gap-8 sm:flex-row">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-3 text-[13px] leading-6 text-muted">
              An explainable resume analyzer for people who would rather fix the
              gap than guess at it.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 text-[12px] sm:grid-cols-3">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-muted">
                <li><Link href="/analyze" className="hover:text-foreground">Analyzer</Link></li>
                <li><Link href="/sample" className="hover:text-foreground">Sample report</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                Learn
              </p>
              <ul className="mt-3 space-y-2 text-muted">
                <li><Link href="/#how-it-works" className="hover:text-foreground">How it works</Link></li>
                <li><Link href="/#scoring" className="hover:text-foreground">Scoring model</Link></li>
                <li><Link href="/#privacy" className="hover:text-foreground">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                Project
              </p>
              <ul className="mt-3 space-y-2 text-muted">
                <li>
                  <a
                    href="https://github.com/Singh24ARPIT/resume-analyzer"
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground"
                  >
                    GitHub
                  </a>
                </li>
                <li><Link href="/analyze" className="hover:text-foreground">No sign-up</Link></li>
                <li><Link href="/sample" className="hover:text-foreground">How it scores</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Resume Analyzer. Built as a B.Tech project.</p>
          <div className="flex items-center gap-4">
            <span>Nothing stored</span>
            <ThemeToggle className="size-8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
