import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const styles = {
  error: {
    box: "border-danger/20 bg-danger-soft text-danger",
    icon: AlertCircle,
  },
  success: {
    box: "border-success/20 bg-success-soft text-success",
    icon: CheckCircle2,
  },
  info: {
    box: "border-border-strong bg-surface-2 text-muted-strong",
    icon: Info,
  },
};

export function Alert({
  children,
  tone = "info",
  className,
  ...props
}: ComponentProps<"div"> & {
  tone?: keyof typeof styles;
  children: ReactNode;
}) {
  const { box, icon: Icon } = styles[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-[13px] leading-5",
        box,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}
