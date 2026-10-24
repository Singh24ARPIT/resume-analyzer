import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  ComponentProps<"textarea">
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-28 w-full resize-y rounded-xl border border-border bg-surface px-3.5 py-3 text-sm leading-6 text-foreground shadow-[inset_0_1px_1px_rgba(16,16,20,0.03)] outline-none transition-colors placeholder:text-muted/70 focus-visible:border-accent/60 focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
