import { Card, CardContent, CardHeader } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";

export const AnalyticsChartsSkeleton = () => (
  <div className="grid gap-4 xl:grid-cols-2">
    {Array.from({ length: 2 }, (_, index) => (
      <Card key={index} className="border-border/60 shadow-sm">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-4 w-56" />
        </CardHeader>
        <CardContent className="h-72">
          <Skeleton className="h-full w-full" />
        </CardContent>
      </Card>
    ))}
  </div>
);
