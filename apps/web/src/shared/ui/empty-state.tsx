import { Button } from "@autolab/ui/components/button";
import type { LucideIcon } from "lucide-react";

type Props = {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: Props) => (
  <div className="flex h-full flex-col items-center justify-center text-center">
    <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-lg bg-muted">
      <Icon className="size-10 text-muted-foreground" strokeWidth={1.5} />
    </div>
    <h3 className="mb-2 text-2xl font-semibold">{title}</h3>
    <p className="mb-6 max-w-md text-muted-foreground">{description}</p>
    {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
  </div>
);
