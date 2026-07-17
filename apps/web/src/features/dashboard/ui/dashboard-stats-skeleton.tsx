import { range } from "@/shared/lib/arrays";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { Card, CardContent, CardHeader } from "@autolab/ui/components/card";

export const DashboardStatsSkeleton = () => (
  <div className="flex flex-1 flex-col gap-4 pt-0">
    <div className="flex flex-wrap items-center gap-3">
      <Skeleton className="h-10 w-80" />
      <Skeleton className="h-10 w-56" />
    </div>

    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {range(4).map((index) => (
        <div
          key={index}
          className="flex min-h-32 flex-col justify-between rounded-xl border border-border/60 bg-card p-4"
        >
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-9 w-24" />
        </div>
      ))}
    </div>

    <div className="grid gap-4 xl:grid-cols-2">
      {range(2).map((index) => (
        <Card key={index} className="border-border/60">
          <CardHeader>
            <Skeleton className="h-5 w-36" />
          </CardHeader>
          <CardContent className="h-72">
            <Skeleton className="h-full w-full" />
          </CardContent>
        </Card>
      ))}
    </div>

    <Card className="border-border/60">
      <CardHeader>
        <Skeleton className="h-5 w-48" />
      </CardHeader>
      <CardContent className="space-y-2">
        {range(4).map((index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </CardContent>
    </Card>
  </div>
);
