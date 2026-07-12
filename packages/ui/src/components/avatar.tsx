import { cn } from "@autolab/ui/lib/utils";

type Props = {
  src?: string | null;
  alt?: string;
  fallback?: string;
  className?: string;
};

export const Avatar = ({ src, alt, fallback, className }: Props) => (
  <div
    className={cn(
      "relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-xs font-medium text-muted-foreground",
      className,
    )}
  >
    {src ? (
      <img src={src} alt={alt ?? ""} className="aspect-square h-full w-full object-cover" />
    ) : (
      <span>{fallback?.slice(0, 2).toUpperCase() ?? "?"}</span>
    )}
  </div>
);
