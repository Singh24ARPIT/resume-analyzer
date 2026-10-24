import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        "flex h-11 w-full rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground shadow-[inset_0_1px_1px_rgba(16,16,20,0.03)] outline-none transition-colors placeholder:text-muted/70 focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
