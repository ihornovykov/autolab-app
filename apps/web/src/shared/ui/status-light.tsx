import { cn } from "@autolab/ui/lib/utils";

const labels: Record<string, string> = {
  PENDING: "Заплановано",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
  ACTIVE: "Активний",
  INACTIVE: "Неактивний",
  OPEN: "Вільно",
  TAKEN: "Зайнято",
};

const dotClasses: Record<string, string> = {
  PENDING: "bg-status-warning shadow-[0_0_8px_var(--status-warning)]",
  IN_PROGRESS: "bg-status-info animate-status-pulse shadow-[0_0_8px_var(--status-info)]",
  COMPLETED: "bg-status-success shadow-[0_0_8px_var(--status-success)]",
  CANCELLED: "bg-status-danger/50 shadow-none",
  ACTIVE: "bg-status-success shadow-[0_0_8px_var(--status-success)]",
  INACTIVE: "bg-muted-foreground/40 shadow-none",
  OPEN: "bg-status-success shadow-[0_0_8px_var(--status-success)]",
  TAKEN: "bg-muted-foreground/40 shadow-none",
};

type Props = {
  status?:
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "ACTIVE"
    | "INACTIVE"
    | "OPEN"
    | "TAKEN";
  label?: string;
  className?: string;
};

export const StatusLight = ({ status = "PENDING", label, className }: Props) => (
  <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
    <span className={cn("size-2 rounded-full", dotClasses[status])} aria-hidden />
    <span>{label ?? labels[status]}</span>
  </span>
);
