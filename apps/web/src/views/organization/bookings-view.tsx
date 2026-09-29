import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { CalendarDaysIcon, PlusIcon } from "lucide-react";
import { useMemo } from "react";

import { useBookingsFilters } from "@/features/booking/hooks/use-bookings-filters";
import { BOOKINGS_PAGE_SIZE } from "@/features/booking/lib/constants";
import { groupBookingsByDate, hasDateRangeFilter, toListBookingsDateRange } from "@/features/booking/lib/utils";
import { BookingListCard, BookingListSkeleton } from "@/features/booking/ui/booking-list-card";
import { orpc } from "@/shared/api/orpc";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";
import { isQueryContentLoading } from "@/shared/lib/query";
import { DataTableLayout } from "@/shared/ui/data-table-layout";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { DataTableSearch } from "@/shared/ui/data-table-search";
import { EmptyState } from "@/shared/ui/empty-state";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Button } from "@autolab/ui/components/button";
import { Checkbox } from "@autolab/ui/components/checkbox";
import { DateRangePicker, type DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";
import { Label } from "@autolab/ui/components/label";

export const BookingsView = () => {
  const organizationId = useSelectedOrganizationId();
  const navigate = useNavigate();
  const {
    search,
    debouncedSearch,
    page,
    status,
    showPast,
    showCancelled,
    dateRange,
    setSearch,
    setPage,
    setShowPast,
    setShowCancelled,
    setDateRange,
  } = useBookingsFilters();

  const bookingsQuery = useQuery({
    ...orpc.booking.listBookings.queryOptions({
      input: {
        organizationId: organizationId!,
        page,
        pageSize: BOOKINGS_PAGE_SIZE,
        search: debouncedSearch || undefined,
        status: status === "ALL" ? undefined : status,
        includeCancelled: showCancelled,
        includePast: showPast,
        sort: "upcoming",
        ...toListBookingsDateRange(dateRange),
      },
    }),
    enabled: !!organizationId,
  });

  const groups = useMemo(
    () => groupBookingsByDate(bookingsQuery.data?.items ?? [], { pastOnly: showPast }),
    [bookingsQuery.data?.items, showPast],
  );

  const handleBookingClick = (bookingId: string) => {
    navigate({
      to: "/dashboard/organization/bookings/$bookingId",
      params: { bookingId },
    });
  };

  const handleCreateBooking = () => {
    navigate({ to: "/dashboard/organization/bookings/new" });
  };

  if (!organizationId) return null;

  const total = bookingsQuery.data?.total ?? 0;
  const totalPages = bookingsQuery.data?.totalPages ?? 0;
  const isLoading = isQueryContentLoading(bookingsQuery, {
    isPending: search !== debouncedSearch,
  });
  const hasActiveFilters =
    Boolean(search) ||
    status !== "ALL" ||
    showCancelled ||
    showPast ||
    hasDateRangeFilter(dateRange);

  return (
    <PageContainer scrollable={false}>
      <Heading title="Записи" />
      <DataTableLayout
        className="min-h-0 flex-1"
        toolbarLeft={
          <div className="flex flex-wrap items-center gap-3">
            <DataTableSearch
              value={search}
              onChange={setSearch}
              placeholder="Пошук за авто, номером або послугою"
            />
            <DateRangePicker
              value={dateRange}
              onChange={(value: DateRangeFilterValue | null) => setDateRange(value)}
              placeholder="Дата або період"
              className="w-full md:w-52"
            />
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-past-bookings"
                checked={showPast}
                onCheckedChange={(checked) => setShowPast(checked === true)}
              />
              <Label htmlFor="show-past-bookings" className="text-sm font-normal">
                Показати минулі
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="show-cancelled-bookings"
                checked={showCancelled}
                onCheckedChange={(checked) => setShowCancelled(checked === true)}
              />
              <Label htmlFor="show-cancelled-bookings" className="text-sm font-normal">
                Показати скасовані
              </Label>
            </div>
          </div>
        }
        toolbarRight={
          <Button icon={<PlusIcon />} onClick={handleCreateBooking}>
            Додати
          </Button>
        }
      >
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-md border bg-card">
            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {isLoading ? (
                <BookingListSkeleton count={BOOKINGS_PAGE_SIZE} />
              ) : groups.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <EmptyState
                    icon={CalendarDaysIcon}
                    title="Записів не знайдено"
                    description={
                      hasActiveFilters
                        ? "Спробуйте змінити фільтри або пошук"
                        : "Створіть перший запис для вашої організації"
                    }
                    actionLabel={hasActiveFilters ? undefined : "Додати запис"}
                    onAction={hasActiveFilters ? undefined : handleCreateBooking}
                  />
                </div>
              ) : (
                <div className="space-y-4">
                  {groups.map((group) => (
                    <section key={group.key}>
                      <h2 className="mb-2 text-sm font-semibold capitalize text-muted-foreground">
                        {group.label}
                      </h2>
                      <div className="space-y-2">
                        {group.bookings.map((booking) => (
                          <BookingListCard
                            key={booking.id}
                            booking={booking}
                            employeeName={booking.employee?.name}
                            onClick={() => handleBookingClick(booking.id)}
                          />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </div>

            <DataTablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={BOOKINGS_PAGE_SIZE}
              onPageChange={setPage}
            />
          </div>
        </div>
      </DataTableLayout>
    </PageContainer>
  );
};
