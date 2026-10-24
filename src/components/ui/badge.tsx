import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
  {
    variants: {
      variant: {
        default: "border-border bg-surface text-muted-strong",
        accent: "border-accent/15 bg-accent-soft text-accent",
        success: "border-success/15 bg-success-soft text-success",
        warning: "border-warning/15 bg-warning-soft text-warning",
        danger: "border-danger/15 bg-danger-soft text-danger",
        outline: "border-border-strong bg-transparent text-muted-strong",
        lime: "border-transparent bg-lime text-[#1a2e05]",
        dark: "border-transparent bg-foreground text-background",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
