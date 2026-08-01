import { ClientOnly } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";

import { AnalyticsChartsSkeleton } from "@/features/dashboard/ui/analytics-charts-skeleton";

type RevenuePoint = {
  date: string;
  revenue: string;
  bookingsCount: number;
};

type Status = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

type StatusPoint = {
  status: Status;
  count: number;
  revenue: string;
};

type Props = {
  revenueTimeSeries: RevenuePoint[];
  statusBreakdown: StatusPoint[];
};

type AnalyticsChartsComponent = ComponentType<Props>;

const AnalyticsChartsClient = (props: Props) => {
  const [Charts, setCharts] = useState<AnalyticsChartsComponent | null>(null);

  useEffect(() => {
    void import("@/features/dashboard/ui/analytics-charts").then((module) => {
      setCharts(() => module.AnalyticsCharts);
    });
  }, []);

  if (!Charts) return <AnalyticsChartsSkeleton />;

  return <Charts {...props} />;
};

export const AnalyticsChartsSection = (props: Props) => (
  <ClientOnly fallback={<AnalyticsChartsSkeleton />}>
    <AnalyticsChartsClient {...props} />
  </ClientOnly>
);
