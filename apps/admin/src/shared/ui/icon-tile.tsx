import { cn } from "@autolab/ui/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  className?: string;
};

export const IconTile = ({ icon: Icon, className }: Props) => (
  <span
    className={cn(
      "flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/70",
      className,
    )}
  >
    <Icon className="size-4" />
  </span>
);
