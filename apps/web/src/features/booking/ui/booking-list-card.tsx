import { ChevronRightIcon, ClockIcon } from "lucide-react";

import { type BookingRow } from "@/features/booking/lib/booking-row";
import { BookingDiscountDisplay } from "@/features/booking/ui/booking-discount-display";
import { formatBookingTimeShort } from "@/features/booking/lib/format-booking-time";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { range } from "@/shared/lib/arrays";
import { formatPrice } from "@/shared/lib/money";
import { StatusLight } from "@/shared/ui/status-light";
import { Badge } from "@autolab/ui/components/badge";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  booking: BookingRow;
  employeeName?: string;
  onClick?: () => void;
  className?: string;
};

export const BookingListCard = ({ booking, employeeName, onClick, className }: Props) => {
  const vehicle = booking.vehicle;
  const vehicleTitle = vehicle ? `${vehicle.make} ${vehicle.model}` : "Автомобіль";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-4 text-left transition-colors hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <VehicleMakeIcon make={vehicle?.make ?? ""} className="size-12 shrink-0" iconClassName="size-6" />

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold tracking-tight">{vehicleTitle}</p>
            {vehicle?.year ? (
              <p className="text-sm text-muted-foreground">{vehicle.year} рік</p>
            ) : null}
          </div>
          <div className="shrink-0 text-right">
            <BookingDiscountDisplay
              services={booking.services ?? []}
              totalPrice={booking.totalPrice}
              className="mb-0.5"
            />
            <p className="text-base font-semibold tabular-nums">{formatPrice(booking.totalPrice)}</p>
          </div>
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <StatusLight status={booking.status} className="text-sm" />
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <ClockIcon className="size-3.5 shrink-0 opacity-70" />
            {formatBookingTimeShort(booking.startTime, booking.endTime)}
          </span>
          {employeeName ? (
            <span className="text-sm text-muted-foreground">{employeeName}</span>
          ) : null}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {vehicle?.licensePlate ? <LicencePlate plateNumber={vehicle.licensePlate} /> : null}
          {booking.services?.slice(0, 3).map((service) => (
            <Badge key={service.id} variant="outline" className="font-normal">
              {service.title}
            </Badge>
          ))}
          {booking.services && booking.services.length > 3 ? (
            <Badge variant="secondary" className="font-normal">
              +{booking.services.length - 3}
            </Badge>
          ) : null}
        </div>
      </div>

      <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
};

export const BookingListCardSkeleton = () => (
  <div className="flex w-full items-center gap-4 rounded-xl border border-border/60 bg-card px-4 py-4">
    <Skeleton className="size-12 shrink-0 rounded-xl" />
    <div className="min-w-0 flex-1 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="flex flex-wrap gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-7 w-24 rounded-md" />
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
    </div>
  </div>
);

export const BookingListSkeleton = ({ count = 5 }: { count?: number }) => (
  <div className="space-y-2">
    {range(count).map((index) => (
      <BookingListCardSkeleton key={index} />
    ))}
  </div>
);
