import { cn } from "@autolab/ui/lib/utils";
import { Label } from "@autolab/ui/components/label";

type Props = React.ComponentProps<"textarea"> & {
  label?: string;
  error?: string;
};

export const Textarea = ({ className, label, error, id, ...props }: Props) => (
  <div className="space-y-1">
    {label ? <Label htmlFor={id}>{label}</Label> : null}
    <textarea
      id={id}
      className={cn(
        "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
    {error ? <p className="text-sm text-red-500">{error}</p> : null}
  </div>
);
