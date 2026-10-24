"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Plus, Sparkles, X } from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { SidebarNav, type SidebarViewer } from "@/components/app/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getInitials, cn } from "@/lib/utils";

const pageTitles: Array<[string, string]> = [
  ["/dashboard", "Dashboard"],
  ["/analyze", "New analysis"],
  ["/analyses", "Analysis report"],
  ["/resumes", "Resumes"],
  ["/jobs", "Job descriptions"],
  ["/compare", "Compare resumes"],
  ["/cover-letters", "Cover letters"],
  ["/history", "History"],
  ["/settings", "Settings"],
];

function getPageTitle(pathname: string) {
  return (
    pageTitles.find(
      ([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    )?.[1] ?? "Workspace"
  );
}

export function Topbar({ viewer }: { viewer: SidebarViewer }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const title = getPageTitle(pathname);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface text-muted-strong lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-4" />
          </button>
          <div className="lg:hidden">
            <Logo showWordmark={false} />
          </div>
          <div className="hidden items-center gap-2 text-[13px] lg:flex">
            <span className="text-muted">Workspace</span>
            <span className="text-border-strong">/</span>
            <span className="font-medium">{title}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {viewer.type === "demo" ? (
            <Badge variant="warning" className="hidden sm:inline-flex">
              Demo mode
            </Badge>
          ) : null}
          <ThemeToggle />
          <Link
            href="/analyze"
            className={cn(buttonVariants({ size: "default" }), "hidden sm:inline-flex")}
          >
            <Plus className="size-4" />
            New analysis
          </Link>
          <Link
            href="/settings"
            className="flex size-9 items-center justify-center rounded-full border border-border bg-surface font-mono text-[10px] font-semibold text-muted-strong lg:hidden"
            aria-label="Settings"
          >
            {getInitials(viewer.name, viewer.email)}
          </Link>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/45 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 flex w-[86%] max-w-[310px] flex-col overflow-y-auto border-r border-border bg-surface px-3 py-5">
            <div className="flex items-center justify-between px-2">
              <Logo />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex size-9 items-center justify-center rounded-xl border border-border text-muted"
                aria-label="Close navigation"
              >
                <X className="size-4" />
              </button>
            </div>

            <Link
              href="/analyze"
              onClick={() => setOpen(false)}
              className="mt-6 flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-[13px] font-medium"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="size-3.5 text-accent" />
                New analysis
              </span>
              <Plus className="size-3.5 text-muted" />
            </Link>

            <SidebarNav onNavigate={() => setOpen(false)} />

            <div className="mt-auto space-y-2 px-2 pt-6">
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="block rounded-lg px-3 py-2 text-[13px] text-muted hover:bg-surface-2"
              >
                Settings
              </Link>
              <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background/60 p-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-foreground font-mono text-[10px] font-semibold text-background">
                  {getInitials(viewer.name, viewer.email)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-medium">{viewer.name}</p>
                  <p className="truncate text-[10px] text-muted">{viewer.email}</p>
                </div>
                <form action={signOutAction}>
                  <button
                    type="submit"
                    className="rounded-lg px-2 py-1 text-[11px] text-muted hover:text-foreground"
                  >
                    {viewer.type === "demo" ? "Exit" : "Sign out"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
