import { CarFrontIcon } from "lucide-react";
import { useState } from "react";

import { getVehicleIconUrl } from "@/features/vehicle/lib/utils";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  make: string;
  className?: string;
  iconClassName?: string;
};

export const VehicleMakeIcon = ({ make, className, iconClassName }: Props) => {
  const [hasError, setHasError] = useState(false);
  const iconUrl = getVehicleIconUrl(make);

  if (!iconUrl || hasError) {
    return (
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl border border-border/60 bg-muted/40",
          className,
        )}
      >
        <CarFrontIcon className={cn("size-7 text-muted-foreground/70", iconClassName)} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-xl border border-border/60 bg-background p-2.5 shadow-sm",
        className,
      )}
    >
      <img
        src={iconUrl}
        alt={make}
        className={cn("size-full object-contain", iconClassName)}
        loading="lazy"
        onError={() => setHasError(true)}
      />
    </div>
  );
};
