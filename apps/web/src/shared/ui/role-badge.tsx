import { Badge } from "@autolab/ui/components/badge";
import { cn } from "@autolab/ui/lib/utils";

const roleConfig = {
  OWNER: {
    label: "Власник",
    className: "border-primary/20 bg-primary/10 text-primary",
  },
  MANAGER: {
    label: "Менеджер",
    className: "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  },
  TECHNICIAN: {
    label: "Працівник",
    className: "border-border bg-muted/60 text-muted-foreground",
  },
} as const;

type Props = {
  role: keyof typeof roleConfig;
};

export const RoleBadge = ({ role }: Props) => {
  const config = roleConfig[role];

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", config.className)}
    >
      {config.label}
    </Badge>
  );
};
