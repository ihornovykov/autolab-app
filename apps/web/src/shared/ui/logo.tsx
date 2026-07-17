import { cn } from "@autolab/ui/lib/utils";

type Props = {
  className?: string;
  variant?: "default" | "inverse";
};

export const Logo = ({ className, variant = "default" }: Props) => (
  <div className={cn("flex items-center gap-1", className)}>
    <img src="/icons/autolab.svg" alt="Autolab" width={32} height={32} />
    <div
      className={cn(
        "grid flex-1 text-left text-xl uppercase italic leading-tight",
        variant === "inverse" && "text-white",
      )}
    >
      <span className="font-bold">Autolab</span>
    </div>
  </div>
);
