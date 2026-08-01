import dayjs from "dayjs";
import { Area, AreaChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis } from "recharts";

import { formatPrice } from "@/shared/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@autolab/ui/components/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@autolab/ui/components/chart";

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

const statusLabels: Record<Status, string> = {
  PENDING: "Заплановано",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
};

const statusColors: Record<Status, string> = {
  PENDING: "var(--status-warning)",
  IN_PROGRESS: "var(--status-info)",
  COMPLETED: "var(--status-success)",
  CANCELLED: "var(--status-danger)",
};

const revenueChartConfig = {
  revenue: {
    label: "Дохід",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const statusChartConfig = {
  count: { label: "Записи" },
  PENDING: { label: statusLabels.PENDING, color: statusColors.PENDING },
  IN_PROGRESS: { label: statusLabels.IN_PROGRESS, color: statusColors.IN_PROGRESS },
  COMPLETED: { label: statusLabels.COMPLETED, color: statusColors.COMPLETED },
  CANCELLED: { label: statusLabels.CANCELLED, color: statusColors.CANCELLED },
} satisfies ChartConfig;

type Props = {
  revenueTimeSeries: RevenuePoint[];
  statusBreakdown: StatusPoint[];
};

export const AnalyticsCharts = ({ revenueTimeSeries, statusBreakdown }: Props) => {
  const revenueData = revenueTimeSeries.map((point) => ({
    date: dayjs(point.date).format("D MMM"),
    revenue: Number(point.revenue),
    bookingsCount: point.bookingsCount,
  }));

  const statusData = statusBreakdown.map((point) => ({
    status: point.status,
    label: statusLabels[point.status],
    count: point.count,
    revenue: point.revenue,
    fill: statusColors[point.status],
  }));

  const totalStatusCount = statusData.reduce((sum, point) => sum + point.count, 0);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base">Дохід по днях</CardTitle>
          <CardDescription>Динаміка доходу за обраний період</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {revenueData.length ? (
            <ChartContainer config={revenueChartConfig} className="aspect-auto h-60 min-h-60 w-full sm:h-72 sm:min-h-72">
              <AreaChart data={revenueData} margin={{ left: 4, right: 4 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.04} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border/60" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={56}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value: number) => formatPrice(value)}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => value}
                      formatter={(value, _name, item) => (
                        <div className="flex w-full items-center justify-between gap-3">
                          <span className="flex items-center gap-1.5 text-muted-foreground">
                            <span
                              className="size-2 shrink-0 rounded-[2px]"
                              style={{ backgroundColor: "var(--color-revenue)" }}
                            />
                            Дохід
                          </span>
                          <span className="font-mono font-medium tabular-nums text-foreground">
                            {formatPrice(Number(value))}
                          </span>
                          {item?.payload?.bookingsCount != null ? (
                            <span className="text-muted-foreground">
                              · {item.payload.bookingsCount} записів
                            </span>
                          ) : null}
                        </div>
                      )}
                    />
                  }
                />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenue)"
                  stroke="var(--color-revenue)"
                  strokeWidth={2.5}
                  activeDot={{ r: 4 }}
                />
              </AreaChart>
            </ChartContainer>
          ) : (
            <p className="flex h-60 items-center justify-center text-sm text-muted-foreground sm:h-72">
              Немає даних за обраний період
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-base">Записи за статусом</CardTitle>
          <CardDescription>Розподіл записів за обраний період</CardDescription>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          {statusData.length ? (
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ChartContainer
                config={statusChartConfig}
                className="mx-auto aspect-square h-56 min-h-56 w-full max-w-56 shrink-0"
              >
                <PieChart>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="status"
                        formatter={(value, _name, item) => (
                          <div className="flex w-full items-center justify-between gap-3">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span
                                className="size-2 shrink-0 rounded-[2px]"
                                style={{ backgroundColor: item?.payload?.fill }}
                              />
                              {item?.payload?.label}
                            </span>
                            <span className="font-mono font-medium tabular-nums text-foreground">
                              {value}
                            </span>
                          </div>
                        )}
                      />
                    }
                  />
                  <Pie
                    data={statusData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={56}
                    outerRadius={80}
                    strokeWidth={3}
                    paddingAngle={2}
                  >
                    <Label
                      content={({ viewBox }) => {
                        if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) return null;
                        const { cx, cy } = viewBox;
                        return (
                          <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
                            <tspan x={cx} y={cy} className="fill-foreground text-3xl font-bold">
                              {totalStatusCount}
                            </tspan>
                            <tspan
                              x={cx}
                              y={(cy ?? 0) + 20}
                              className="fill-muted-foreground text-xs"
                            >
                              записів
                            </tspan>
                          </text>
                        );
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>

              <div className="flex w-full flex-1 flex-col gap-2">
                {statusData.map((item) => (
                  <div
                    key={item.status}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium tabular-nums">{item.count}</p>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        {formatPrice(item.revenue)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="flex h-60 items-center justify-center text-sm text-muted-foreground sm:h-72">
              Немає даних за обраний період
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
