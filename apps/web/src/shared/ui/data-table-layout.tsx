import { cn } from "@autolab/ui/lib/utils";

type Props = {
  toolbarLeft?: React.ReactNode;
  toolbarRight?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const DataTableLayout = ({
  toolbarLeft,
  toolbarRight,
  children,
  className,
}: Props) => (
  <div className={cn("mt-2 flex min-h-0 flex-1 flex-col gap-4", className)}>
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-3">{toolbarLeft}</div>
      {toolbarRight ? <div className="flex shrink-0 items-center gap-2">{toolbarRight}</div> : null}
    </div>
    <div className="flex min-h-0 flex-1 flex-col">{children}</div>
  </div>
);
