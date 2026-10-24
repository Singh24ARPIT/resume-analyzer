"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  FileText,
  GitCompareArrows,
  History,
  LogOut,
  PenLine,
  ScanSearch,
  Settings,
  Sparkles,
} from "lucide-react";
import { signOutAction } from "@/app/(auth)/actions";
import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { cn, getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/analyze", label: "New analysis", icon: ScanSearch },
  { href: "/resumes", label: "Resumes", icon: FileText },
  { href: "/jobs", label: "Job descriptions", icon: BriefcaseBusiness },
  { href: "/compare", label: "Compare", icon: GitCompareArrows },
  { href: "/cover-letters", label: "Cover letters", icon: PenLine },
  { href: "/history", label: "History", icon: History },
];

export type SidebarViewer = {
  name: string;
  email: string;
  type: "user" | "demo";
};

export function Sidebar({ viewer }: { viewer: SidebarViewer }) {
  return (
    <aside className="sticky top-0 hidden h-screen flex-col border-r border-border bg-surface px-3 py-5 lg:flex">
      <div className="flex items-center justify-between px-2">
        <Logo />
        <Badge variant="outline" className="font-mono text-[9px] uppercase tracking-wider">
          Beta
        </Badge>
      </div>

      <div className="mt-6 px-2">
        <Link
          href="/analyze"
          className="group flex items-center justify-between rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-[13px] font-medium transition-colors hover:border-border-strong hover:bg-background"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="size-3.5 text-accent" />
            New analysis
          </span>
          <ArrowUpRight className="size-3.5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>

      <SidebarNav />

      <div className="mt-auto space-y-2 px-2">
        {viewer.type === "demo" ? (
          <Link
            href="/login?setup=supabase"
            className="block rounded-xl border border-warning/20 bg-warning-soft px-3 py-2.5 text-[11px] leading-4 text-warning transition-colors hover:brightness-95"
          >
            <span className="font-medium">Demo workspace</span>
            <br />
            Connect Supabase to save analyses.
          </Link>
        ) : null}

        <Link
          href="/settings"
          className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
        >
          <Settings className="size-4" />
          Settings
        </Link>

        <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background/60 p-2">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-foreground font-mono text-[10px] font-semibold text-background">
            {getInitials(viewer.name, viewer.email)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-medium leading-4">
              {viewer.name}
            </p>
            <p className="truncate text-[10px] leading-4 text-muted">
              {viewer.email}
            </p>
          </div>
          <form action={signOutAction}>
            <button
              type="submit"
              aria-label={viewer.type === "demo" ? "Exit demo" : "Sign out"}
              className="flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-foreground"
            >
              <LogOut className="size-3.5" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

export function SidebarNav({
  onNavigate,
  className,
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname();

  return (
    <nav className={cn("mt-6 flex flex-col gap-1 px-2", className)}>
      <p className="mb-1 px-3 font-mono text-[9px] uppercase tracking-[0.18em] text-muted/70">
        Workspace
      </p>
      {navItems.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition-colors",
              active
                ? "bg-foreground text-background"
                : "text-muted hover:bg-surface-2 hover:text-foreground",
            )}
          >
            <item.icon
              className={cn(
                "size-4 shrink-0",
                active ? "opacity-100" : "opacity-70",
              )}
            />
            <span className="flex-1">{item.label}</span>
            {active ? (
              <span className="size-1.5 rounded-full bg-lime" aria-hidden="true" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
