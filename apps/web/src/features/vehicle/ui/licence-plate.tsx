import { cn } from "@autolab/ui/lib/utils";

type Props = {
  plateNumber: string;
  className?: string;
};

export const LicencePlate = ({ plateNumber, className }: Props) => (
  <div
    className={cn(
      "flex w-fit items-center gap-2 rounded border-2 border-foreground/70 bg-background px-3 py-1 shadow-sm",
      className,
    )}
  >
    <div className="h-3 w-4 overflow-hidden rounded-sm border border-border">
      <div className="h-1/2 bg-blue-500" />
      <div className="h-1/2 bg-yellow-400" />
    </div>
    <span className="font-mono text-sm font-bold tracking-wide">{plateNumber}</span>
  </div>
);
