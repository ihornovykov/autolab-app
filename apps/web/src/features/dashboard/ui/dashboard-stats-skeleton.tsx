import { range } from "@/shared/lib/arrays";
import { Skeleton } from "@autolab/ui/components/skeleton";

export const DashboardStatsSkeleton = () => (
  <div className="flex flex-1 flex-col gap-4 pt-0">
    <div className="grid auto-rows-min gap-4 md:grid-cols-3">
      {range(3).map((index) => (
        <div
          key={index}
          className="flex aspect-video flex-col justify-between rounded-xl bg-muted/50 p-4"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-20" />
        </div>
      ))}
    </div>
    <div className="min-h-[40vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
      <Skeleton className="mb-4 h-6 w-24" />
      <div className="space-y-2">
        {range(3).map((index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3"
          >
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-56" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);
