import { parseAsBoolean, parseAsStringLiteral, useQueryStates } from "nuqs";

import type { BookingStatusFilter } from "@/features/booking/lib/types";
import { useDebouncedValue } from "@/shared/hooks/use-debounce";
import {
  fromDateRangeFilter,
  parseAsDateParam,
  parseAsPage,
  parseAsSearchQuery,
  toDateRangeFilter,
} from "@/shared/lib/nuqs-parsers";
import type { DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";

export const bookingsFilterParams = {
  q: parseAsSearchQuery,
  page: parseAsPage,
  status: parseAsStringLiteral([
    "ALL",
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ] as const).withDefault("ALL"),
  past: parseAsBoolean.withDefault(false),
  cancelled: parseAsBoolean.withDefault(false),
  from: parseAsDateParam,
  to: parseAsDateParam,
} as const;

export const useBookingsFilters = () => {
  const [filters, setFilters] = useQueryStates(bookingsFilterParams);
  const debouncedSearch = useDebouncedValue(filters.q);
  const dateRange = toDateRangeFilter(filters.from, filters.to);

  return {
    search: filters.q,
    debouncedSearch,
    page: filters.page,
    status: filters.status as BookingStatusFilter,
    showPast: filters.past,
    showCancelled: filters.cancelled,
    dateRange,
    setSearch: (value: string) => setFilters({ q: value || null, page: 1 }),
    setPage: (page: number) => setFilters({ page }),
    setStatus: (status: BookingStatusFilter) => setFilters({ status, page: 1 }),
    setShowPast: (showPast: boolean) => setFilters({ past: showPast || null, page: 1 }),
    setShowCancelled: (showCancelled: boolean) =>
      setFilters({ cancelled: showCancelled || null, page: 1 }),
    setDateRange: (value: DateRangeFilterValue | null) => {
      const range = fromDateRangeFilter(value);
      setFilters({
        from: range.from,
        to: range.to,
        page: 1,
      });
    },
  };
};
