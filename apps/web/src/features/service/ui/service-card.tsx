import { ClockIcon, WrenchIcon } from "lucide-react";

import { range } from "@/shared/lib/arrays";
import { formatPrice } from "@/shared/lib/format";
import { Badge } from "@autolab/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";

type Service = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price: string;
  duration: number;
};

type Props = {
  service: Service;
  className?: string;
  onClick?: () => void;
};

export const ServiceCard = ({ service, className, onClick }: Props) => (
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
      "group flex h-full w-full flex-col overflow-hidden border-border/70 shadow-sm transition-all duration-200",
      onClick &&
        "cursor-pointer hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      !onClick && "hover:border-primary/25 hover:shadow-md",
      className,
    )}
  >
    <CardHeader className="shrink-0 space-y-0 bg-muted/20 p-4 pb-0">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm ring-1 ring-border/50 transition-colors group-hover:ring-primary/20">
          <WrenchIcon className="size-5 text-primary/80" />
        </div>
        <div className="min-w-0 flex-1">
          <Badge
            variant="secondary"
            className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
          >
            {service.category?.trim() || "Інше"}
          </Badge>
          <CardTitle className="mt-2 line-clamp-2 text-base font-bold leading-snug tracking-tight">
            {service.title}
          </CardTitle>
        </div>
      </div>
    </CardHeader>

    <CardContent className="flex flex-1 flex-col p-4 pt-2">
      {service.description ? (
        <p className="line-clamp-2 min-h-10 text-sm leading-relaxed text-muted-foreground">
          {service.description}
        </p>
      ) : (
        <div className="min-h-10" />
      )}

      <div className="mt-auto flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/35 px-3 py-3">
        <div className="min-w-0">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Вартість
          </span>
          <p className="truncate text-xl font-bold tracking-tight">{formatPrice(service.price)}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-background px-2.5 py-1.5 shadow-sm ring-1 ring-border/50">
          <ClockIcon className="size-3.5 text-muted-foreground" />
          <span className="text-sm font-medium tabular-nums">{service.duration} хв</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

export const ServiceCardSkeleton = () => (
  <Card className="flex h-full w-full flex-col overflow-hidden border-border/70 shadow-sm">
    <CardHeader className="shrink-0 space-y-0 bg-muted/20 p-4 pb-0">
      <div className="flex items-start gap-3">
        <Skeleton className="size-11 shrink-0 rounded-xl" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-3/4" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col p-4 pt-2">
      <Skeleton className="mb-4 h-10 w-full" />
      <div className="mt-auto flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/35 px-3 py-3">
        <div className="space-y-2">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </CardContent>
  </Card>
);

export const ServiceCardGridSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-3">
    {range(count).map((index) => (
      <ServiceCardSkeleton key={index} />
    ))}
  </div>
);
