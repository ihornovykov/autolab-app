import { cn } from "@autolab/ui/lib/utils";

type Props = {
  children: React.ReactNode;
  className?: string;
  scrollable?: boolean;
};

export const PageContainer = ({ children, className, scrollable = true }: Props) => {
  if (!scrollable) {
    return (
      <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>{children}</div>
    );
  }

  return (
    <div className={cn("h-full min-h-0 overflow-y-auto px-0.5", className)}>{children}</div>
  );
};

type HeadingProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const Heading = ({ title, description, action }: HeadingProps) => (
  <div className="mb-1 grid shrink-0 gap-1">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h1>
        {description ? <p className="text-base text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
    <div className="h-[1px] w-full bg-muted" />
  </div>
);
