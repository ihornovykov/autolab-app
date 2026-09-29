import { CalendarIcon, ClockIcon, FuelIcon, UserIcon } from "lucide-react";
import type { ComponentType, ReactNode } from "react";

import { type VehicleBookingHistoryItem } from "@/features/booking/lib/types";
import { LicencePlate } from "@/features/vehicle/ui/licence-plate";
import { range } from "@/shared/lib/arrays";
import { formatDate } from "@/shared/lib/date";
import { formatPrice } from "@/shared/lib/money";
import { Badge } from "@autolab/ui/components/badge";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  bookings: VehicleBookingHistoryItem[];
  isLoading?: boolean;
  onBookingClick?: (booking: VehicleBookingHistoryItem) => void;
};

export const VehicleServiceHistorySkeleton = () => (
  <div className="space-y-2">
    {range(3).map((index) => (
      <div
        key={index}
        className="rounded-xl border border-border/60 bg-card px-4 py-4"
      >
        <div className="flex items-start justify-between gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="mt-3 h-4 w-40" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-6 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

export const VehicleServiceHistory = ({ bookings, isLoading, onBookingClick }: Props) => {
  if (isLoading) {
    return <VehicleServiceHistorySkeleton />;
  }

  if (!bookings.length) {
    return (
      <p className="rounded-xl border border-dashed border-border/60 px-4 py-10 text-center text-sm text-muted-foreground">
        Записів для цього авто ще немає
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <button
          key={booking.id}
          type="button"
          onClick={() => onBookingClick?.(booking)}
          disabled={!onBookingClick}
          className={cn(
            "w-full rounded-xl border border-border/60 bg-card px-4 py-4 text-left transition-colors",
            onBookingClick &&
              "cursor-pointer hover:bg-muted/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          )}
        >
          <div className="flex items-start justify-end">
            <p className="shrink-0 text-base font-semibold tabular-nums">
              {formatPrice(booking.totalPrice)}
            </p>
          </div>

          <p className="mt-2.5 inline-flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarIcon className="size-4 shrink-0 opacity-70" />
            {formatDate(booking.startTime)}
          </p>

          {booking.services?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {booking.services.map((service) => (
                <Badge key={service.id} variant="outline" className="font-normal">
                  {service.title}
                </Badge>
              ))}
            </div>
          ) : null}
        </button>
      ))}
    </div>
  );
};

type SpecItem = {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string }>;
};

type SpecsProps = {
  items: SpecItem[];
};

export const VehicleSpecsGrid = ({ items }: SpecsProps) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
    {items.map((item) => {
      const Icon = item.icon;
      return (
        <div
          key={item.label}
          className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/15 px-3 py-3"
        >
          {Icon ? (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm ring-1 ring-border/50">
              <Icon className="size-4 text-primary/80" />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.label}
            </p>
            <p className="truncate text-sm font-medium">{item.value}</p>
          </div>
        </div>
      );
    })}
  </div>
);

export const VehicleDetailSection = ({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) => (
  <section className={cn("rounded-xl border border-border/70 bg-card shadow-sm", className)}>
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
      <div>
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action}
    </div>
    <div className="p-5">{children}</div>
  </section>
);

export const VehicleLicensePlateDisplay = ({ licensePlate }: { licensePlate?: string | null }) => (
  <div className="flex min-h-12 items-center">
    {licensePlate ? (
      <LicencePlate plateNumber={licensePlate} />
    ) : (
      <span className="text-sm text-muted-foreground">Номер не вказано</span>
    )}
  </div>
);

export const vehicleSpecIcons = {
  calendar: CalendarIcon,
  clock: ClockIcon,
  fuel: FuelIcon,
  user: UserIcon,
};

export const VehicleDetailContentSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-8 w-36" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="size-9" />
      </div>
    </div>

    <div className="rounded-xl border border-border/70 bg-muted/20 p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 shrink-0 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-56" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
        <Skeleton className="h-8 w-32 rounded-md" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
      <div className="xl:col-span-2">
        <div className="rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="border-b border-border/60 px-5 py-4">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 gap-2 p-5 sm:grid-cols-2">
            {range(6).map((index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
      <div className="xl:col-span-3">
        <div className="rounded-xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
          <div className="p-5">
            <VehicleServiceHistorySkeleton />
          </div>
        </div>
      </div>
    </div>
  </div>
);
