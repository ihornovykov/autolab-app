import { cn } from "@autolab/ui/lib/utils";

type Props = {
  className?: string;
  variant?: "default" | "inverse";
};

export const Logo = ({ className, variant = "default" }: Props) => (
  <div className={cn("flex items-center gap-2", className)}>
    <img src="/icons/autolab.svg" alt="Autolab" width={32} height={32} />
    <div
      className={cn(
        "flex h-8 flex-col items-start justify-center gap-0",
        variant === "inverse" && "text-white",
      )}
    >
      <span className="text-xl font-bold uppercase italic leading-none">Autolab</span>
      <span
        className={cn(
          "rounded px-1 py-px text-[10px] font-semibold uppercase not-italic leading-none tracking-wide",
          variant === "inverse" ? "bg-white/20 text-white" : "bg-primary text-primary-foreground",
        )}
      >
        Admin
      </span>
    </div>
  </div>
);
