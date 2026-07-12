import { CalendarIcon } from "lucide-react";

import { getVehicleIconUrl } from "@/features/vehicle/lib/utils";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { cn } from "@autolab/ui/lib/utils";

type VehicleIdentity = {
  make: string;
  model: string;
  year: number;
};

type Props = {
  vehicle: VehicleIdentity;
};

export const VehicleTableIdentity = ({ vehicle }: Props) => {
  const hasBrandIcon = Boolean(getVehicleIconUrl(vehicle.make));

  return (
    <div className="flex items-center gap-3 py-0.5">
      <VehicleMakeIcon make={vehicle.make} className="size-11" iconClassName="size-6" />
      <div className="min-w-0">
        <p
          className={cn(
            "truncate text-[11px] font-semibold uppercase tracking-wider",
            hasBrandIcon ? "text-muted-foreground" : "text-foreground/80",
          )}
        >
          {vehicle.make}
        </p>
        <p className="truncate text-sm font-semibold leading-snug">{vehicle.model}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
          <CalendarIcon className="size-3 shrink-0" />
          {vehicle.year} рік
        </span>
      </div>
    </div>
  );
};

type LicensePlateCellProps = {
  licensePlate?: string | null;
};

export const VehicleTableLicensePlate = ({ licensePlate }: LicensePlateCellProps) => (
  <div className="flex min-h-10 items-center py-0.5">
    {licensePlate ? (
      <LicencePlate plateNumber={licensePlate} className="scale-90 origin-left" />
    ) : (
      <span className="text-sm text-muted-foreground">Не вказано</span>
    )}
  </div>
);
