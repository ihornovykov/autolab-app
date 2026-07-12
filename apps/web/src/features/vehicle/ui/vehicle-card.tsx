import { CalendarIcon, FuelIcon } from "lucide-react";

import { getVehicleIconUrl } from "@/features/vehicle/lib/utils";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { Badge } from "@autolab/ui/components/badge";
import { Card, CardTitle } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  bodyStyle?: string | null;
  engine?: string | null;
  engineVolume?: number | null;
};

type Props = {
  vehicle: Vehicle;
  onClick?: () => void;
};

const formatEngineVolume = (value: number) => {
  const formatted = Number(value.toFixed(1));
  return Number.isInteger(formatted) ? `${formatted}` : formatted.toFixed(1);
};

export const VehicleCard = ({ vehicle, onClick }: Props) => {
  const hasBrandIcon = Boolean(getVehicleIconUrl(vehicle.make));

  return (
    <Card
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={cn(
        "group w-full overflow-hidden border-border/70 transition-all duration-200",
        onClick &&
          "cursor-pointer hover:border-primary/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !onClick && "hover:border-primary/25 hover:shadow-md",
      )}
    >
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <VehicleMakeIcon
            make={vehicle.make}
            className="size-12 shrink-0"
            iconClassName="size-6"
          />
          <div className="min-w-0 flex-1">
            <p
              className={cn(
                "truncate text-[11px] font-semibold uppercase tracking-wider",
                hasBrandIcon ? "text-muted-foreground" : "text-foreground/80",
              )}
            >
              {vehicle.make}
            </p>
            <CardTitle className="mt-0.5 line-clamp-2 text-base font-bold leading-tight tracking-tight">
              {vehicle.model}
            </CardTitle>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-border/60">
                <CalendarIcon className="size-3 shrink-0" />
                {vehicle.year}
              </span>
              <Badge
                variant="secondary"
                className="max-w-full truncate px-2 py-0.5 text-[11px] font-normal"
              >
                {vehicle.bodyStyle ?? "—"}
              </Badge>
            </div>
          </div>
        </div>

        {vehicle.licensePlate ? (
          <LicencePlate plateNumber={vehicle.licensePlate} />
        ) : (
          <div className="h-8 w-36 rounded border border-dashed border-border/60 bg-muted/20" />
        )}

        <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/35 px-3 py-2">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/50">
            <FuelIcon className="size-3.5 text-primary/80" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Двигун
            </span>
            <p className="truncate text-sm font-semibold leading-snug">
              {vehicle.engine ?? "—"}
              {vehicle.engineVolume ? (
                <span className="ml-1 font-normal text-muted-foreground">
                  ({formatEngineVolume(vehicle.engineVolume)} л)
                </span>
              ) : null}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export const VehicleCardSkeleton = () => (
  <Card className="w-full overflow-hidden border-border/70">
    <div className="space-y-3 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-12 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-1.5">
            <Skeleton className="h-6 w-14 rounded-md" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <Skeleton className="h-8 w-36 rounded-md" />
      <div className="flex items-center gap-2.5 rounded-xl border border-border/50 bg-muted/35 px-3 py-2">
        <Skeleton className="size-7 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
    </div>
  </Card>
);
