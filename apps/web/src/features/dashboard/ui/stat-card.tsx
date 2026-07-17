import type { LucideIcon } from "lucide-react";
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react";

import { cn } from "@autolab/ui/lib/utils";

type Accent = "primary" | "success" | "info" | "warning";

const accentClasses: Record<Accent, string> = {
  primary: "bg-primary/10 text-primary",
  success: "bg-status-success-soft text-status-success",
  info: "bg-status-info-soft text-status-info",
  warning: "bg-status-warning-soft text-status-warning",
};

type Props = {
  label: string;
  value: string | number;
  deltaPercent?: number | null;
  icon: LucideIcon;
  accent?: Accent;
  className?: string;
};

const formatDelta = (deltaPercent: number) => {
  const sign = deltaPercent > 0 ? "+" : "";
  return `${sign}${deltaPercent}%`;
};

export const StatCard = ({
  label,
  value,
  deltaPercent,
  icon: Icon,
  accent = "primary",
  className,
}: Props) => {
  const hasDelta = deltaPercent !== null && deltaPercent !== undefined;
  const isPositive = (deltaPercent ?? 0) >= 0;
  const TrendIcon = isPositive ? TrendingUpIcon : TrendingDownIcon;

  return (
    <div
      className={cn(
        "group relative flex min-h-32 flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            accentClasses[accent],
          )}
        >
          <Icon className="size-5" />
        </span>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
        {hasDelta ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isPositive
                ? "bg-status-success-soft text-status-success"
                : "bg-status-danger-soft text-status-danger",
            )}
          >
            <TrendIcon className="size-3" />
            {formatDelta(deltaPercent)}
          </span>
        ) : null}
      </div>
    </div>
  );
};
