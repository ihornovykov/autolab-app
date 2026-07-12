import { Skeleton } from "@autolab/ui/components/skeleton";

import { VehicleCardSkeleton } from "@/features/vehicle/ui/vehicle-card";

export const BookingDetailSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Skeleton className="h-8 w-36" />
      <div className="flex gap-2">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="size-9" />
      </div>
    </div>

    <div className="rounded-xl border border-border/70 bg-muted/20 p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Skeleton className="size-16 shrink-0 rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-9 w-56" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-24 rounded-full" />
            </div>
            <Skeleton className="h-8 w-32 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>

    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <Skeleton className="mb-4 h-5 w-12" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="mt-3 h-6 w-40 rounded-full" />
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
        <Skeleton className="mb-4 h-5 w-20" />
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border/70 bg-card p-5 shadow-sm xl:col-span-2">
        <Skeleton className="mb-4 h-5 w-20" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-36 rounded-full" />
          <Skeleton className="h-8 w-32 rounded-full" />
        </div>
      </div>
      <div className="xl:col-span-2">
        <Skeleton className="mb-3 h-5 w-24" />
        <div className="max-w-sm">
          <VehicleCardSkeleton />
        </div>
      </div>
    </div>
  </div>
);
