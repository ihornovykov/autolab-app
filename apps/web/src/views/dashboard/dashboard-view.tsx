import { useQuery } from "@tanstack/react-query";
import { Building2Icon } from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import { formatDateTime, formatPrice } from "@/shared/lib/format";
import { useSelectedOrganizationId } from "@/shared/lib/use-selected-organization-id";
import { EmptyState } from "@/shared/ui/empty-state";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { StatusLight } from "@/shared/ui/status-light";

export const DashboardView = () => {
  const organizationId = useSelectedOrganizationId();

  const statsQuery = useQuery({
    ...orpc.booking.getDashboardStats.queryOptions({
      input: { organizationId: organizationId! },
    }),
    enabled: !!organizationId,
  });

  if (!organizationId) {
    return (
      <PageContainer>
        <Heading title="Організація" />
        <EmptyState
          icon={Building2Icon}
          title="Немає організацій"
          description="Щоб побачити огляд, спочатку створіть організацію в налаштуваннях акаунта."
          actionLabel="Створити організацію"
          onAction={() => {
            window.location.href = "/dashboard/account/settings";
          }}
        />
      </PageContainer>
    );
  }

  const stats = statsQuery.data;
  const kpiItems = [
    { label: "Записи сьогодні", value: stats?.bookingsToday ?? 0 },
    { label: "В роботі", value: stats?.inProgress ?? 0 },
    { label: "Дохід за тиждень", value: formatPrice(stats?.revenueThisWeek ?? 0) },
  ];

  return (
    <PageContainer>
      <Heading title="Організація" />
      <div className="flex flex-1 flex-col gap-4 pt-0">
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          {kpiItems.map((item) => (
            <div
              key={item.label}
              className="flex aspect-video flex-col justify-between rounded-xl bg-muted/50 p-4"
            >
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-3xl font-semibold tracking-tight">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="min-h-[40vh] flex-1 rounded-xl bg-muted/50 p-4 md:min-h-min">
          <h2 className="mb-4 text-lg font-semibold">Сьогодні</h2>
          {stats?.todayBookings.length ? (
            <div className="space-y-2">
              {stats.todayBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background px-4 py-3"
                >
                  <div className="space-y-1">
                    <StatusLight status={booking.status} />
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(booking.startTime)} ·{" "}
                      {booking.vehicle
                        ? `${booking.vehicle.make} ${booking.vehicle.model}`
                        : "Авто"}
                      {booking.vehicle?.licensePlate
                        ? ` · ${booking.vehicle.licensePlate}`
                        : ""}
                    </p>
                  </div>
                  <p className="font-mono text-sm">{formatPrice(booking.totalPrice)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">На сьогодні записів немає</p>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
