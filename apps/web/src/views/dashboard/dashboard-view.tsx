import { useQuery } from "@tanstack/react-query";
import {
  Building2Icon,
  CalendarDaysIcon,
  CheckCircle2Icon,
  ClockIcon,
  ReceiptTextIcon,
  UsersIcon,
  WalletIcon,
} from "lucide-react";
import { useMemo } from "react";

import { toListBookingsDateRange } from "@/features/booking/lib/utils";
import { useDashboardFilters } from "@/features/dashboard/hooks/use-dashboard-filters";
import { AnalyticsBookingsTable } from "@/features/dashboard/ui/analytics-bookings-table";
import { AnalyticsChartsSection } from "@/features/dashboard/ui/analytics-charts-section";
import { DashboardDateRange } from "@/features/dashboard/ui/dashboard-date-range";
import { DashboardStatsSkeleton } from "@/features/dashboard/ui/dashboard-stats-skeleton";
import { DownloadAnalyticsReportButton } from "@/features/dashboard/ui/download-analytics-report-button";
import { StatCard } from "@/features/dashboard/ui/stat-card";
import { orpc } from "@/shared/api/orpc";
import { isQueryContentLoading } from "@/shared/lib/query";
import { formatPrice } from "@/shared/lib/money";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";
import { EmptyState } from "@/shared/ui/empty-state";
import { Heading, PageContainer } from "@/shared/ui/page-container";

const DASHBOARD_BOOKINGS_PAGE_SIZE = 10;

export const DashboardView = () => {
  const organizationId = useSelectedOrganizationId();
  const {
    preset,
    dateRange,
    bookingsPage,
    setPreset,
    setDateRange,
    setBookingsPage,
    applyPreset,
  } = useDashboardFilters();

  const analyticsInput = useMemo(() => {
    const range = toListBookingsDateRange(dateRange);
    return {
      organizationId: organizationId!,
      from: range.from ?? "",
      to: range.to ?? "",
    };
  }, [organizationId, dateRange]);

  const bookingsInput = useMemo(
    () => ({
      ...analyticsInput,
      page: bookingsPage,
      pageSize: DASHBOARD_BOOKINGS_PAGE_SIZE,
    }),
    [analyticsInput, bookingsPage],
  );

  const analyticsQuery = useQuery({
    ...orpc.booking.getOrganizationAnalytics.queryOptions({
      input: analyticsInput,
    }),
    enabled: !!organizationId && !!analyticsInput.from && !!analyticsInput.to,
  });

  const bookingsQuery = useQuery({
    ...orpc.booking.listOrganizationAnalyticsBookings.queryOptions({
      input: bookingsInput,
    }),
    enabled: !!organizationId && !!bookingsInput.from && !!bookingsInput.to,
    placeholderData: (previousData) => previousData,
  });

  if (!organizationId) {
    return (
      <PageContainer>
        <Heading title="Огляд" />
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

  const isLoading = isQueryContentLoading(analyticsQuery);
  const analytics = analyticsQuery.data;
  const bookings = bookingsQuery.data;
  const isBookingsLoading = bookingsQuery.isFetching && !bookingsQuery.isLoading;

  return (
    <PageContainer>
      <Heading title="Огляд" />

      <div className="mb-4 mt-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4">
        <DashboardDateRange
          preset={preset}
          value={dateRange}
          onPresetChange={(nextPreset) => {
            if (nextPreset === "custom") {
              setPreset(nextPreset);
              return;
            }
            applyPreset(nextPreset);
          }}
          onValueChange={setDateRange}
          className="w-full min-w-0 lg:flex-1"
        />
        <DownloadAnalyticsReportButton
          organizationId={organizationId}
          dateRange={dateRange}
          className="w-full max-w-full shrink-0 lg:w-auto"
        />
      </div>

      {isLoading ? (
        <DashboardStatsSkeleton />
      ) : analytics ? (
        <div className="flex flex-1 flex-col gap-4 pt-0">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Записи"
              value={analytics.summary.totalBookings}
              deltaPercent={analytics.summary.totalBookingsDeltaPercent}
              icon={CalendarDaysIcon}
              accent="info"
            />
            <StatCard
              label="Виконано"
              value={analytics.summary.completedBookings}
              deltaPercent={analytics.summary.completedBookingsDeltaPercent}
              icon={CheckCircle2Icon}
              accent="success"
            />
            <StatCard
              label="Дохід"
              value={formatPrice(analytics.summary.totalRevenue)}
              deltaPercent={analytics.summary.totalRevenueDeltaPercent}
              icon={WalletIcon}
              accent="primary"
            />
            <StatCard
              label="Нові клієнти"
              value={analytics.summary.newClients}
              deltaPercent={analytics.summary.newClientsDeltaPercent}
              icon={UsersIcon}
              accent="warning"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              label="Середній чек"
              value={formatPrice(analytics.summary.averageTicket)}
              deltaPercent={analytics.summary.averageTicketDeltaPercent}
              icon={ReceiptTextIcon}
              accent="primary"
            />
            <StatCard
              label="В роботі"
              value={analytics.summary.inProgressBookings}
              icon={ClockIcon}
              accent="info"
            />
          </div>

          <AnalyticsChartsSection
            revenueTimeSeries={analytics.revenueTimeSeries}
            statusBreakdown={analytics.statusBreakdown}
          />

          <AnalyticsBookingsTable
            bookings={(bookings?.items ?? []).map((booking) => ({
              ...booking,
              startTime: new Date(booking.startTime),
              endTime: new Date(booking.endTime),
            }))}
            page={bookings?.page ?? bookingsPage}
            totalPages={bookings?.totalPages ?? 0}
            total={bookings?.total ?? 0}
            pageSize={bookings?.pageSize ?? DASHBOARD_BOOKINGS_PAGE_SIZE}
            isLoading={isBookingsLoading}
            onPageChange={setBookingsPage}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Не вдалося завантажити аналітику</p>
      )}
    </PageContainer>
  );
};
