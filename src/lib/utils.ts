import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(input: string | Date, options?: Intl.DateTimeFormatOptions) {
  const date = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    ...options,
  }).format(date);
}

export function formatRelativeDate(input: string | Date) {
  const date = typeof input === "string" ? new Date(input) : input;
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (Number.isNaN(date.getTime())) return "—";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(date);
}

export function scoreBand(score: number) {
  if (score >= 85) {
    return {
      label: "Excellent match",
      short: "Excellent",
      tone: "success" as const,
      description: "Your resume is strongly aligned with this role.",
    };
  }

  if (score >= 70) {
    return {
      label: "Strong match",
      short: "Strong",
      tone: "success" as const,
      description: "You cover the core requirements with a few gaps to close.",
    };
  }

  if (score >= 55) {
    return {
      label: "Moderate match",
      short: "Moderate",
      tone: "accent" as const,
      description: "The foundation is there, but several requirements need attention.",
    };
  }

  return {
    label: "Needs work",
    short: "Low",
    tone: "danger" as const,
    description: "This role is a stretch right now. Focus on the highest-priority gaps.",
  };
}

export function getInitials(name?: string | null, email?: string | null) {
  if (name?.trim()) {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("");
  }

  return email?.slice(0, 2).toUpperCase() ?? "RF";
}

export function truncate(value: string, max = 120) {
  if (value.length <= max) return value;
  return `${value.slice(0, max).trimEnd()}…`;
}
