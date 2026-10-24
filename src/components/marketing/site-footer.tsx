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
                <li><Link href="/compare" className="hover:text-foreground">Compare</Link></li>
                <li><Link href="/sample" className="hover:text-foreground">Sample report</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                Learn
              </p>
              <ul className="mt-3 space-y-2 text-muted">
                <li><a href="#how-it-works" className="hover:text-foreground">How it works</a></li>
                <li><a href="#scoring" className="hover:text-foreground">Scoring model</a></li>
                <li><a href="#privacy" className="hover:text-foreground">Privacy</a></li>
              </ul>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted">
                Account
              </p>
              <ul className="mt-3 space-y-2 text-muted">
                <li><Link href="/login" className="hover:text-foreground">Sign in</Link></li>
                <li><Link href="/signup" className="hover:text-foreground">Create account</Link></li>
                <li><Link href="/settings" className="hover:text-foreground">Settings</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-5 text-[11px] text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Rolefit. Built as a B.Tech project.</p>
          <div className="flex items-center gap-4">
            <span>Private by default</span>
            <ThemeToggle className="size-8" />
          </div>
        </div>
      </div>
    </footer>
  );
}
