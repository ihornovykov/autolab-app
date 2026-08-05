import { parseAsStringLiteral, useQueryStates } from "nuqs";

import { DEFAULT_DASHBOARD_PRESET } from "@/features/dashboard/lib/constants";
import type { DashboardDatePreset } from "@/features/dashboard/lib/types";
import { getDefaultDashboardDateRange, getPresetDateRange } from "@/features/dashboard/lib/utils";
import {
  fromDateRangeFilter,
  parseAsDateParam,
  parseAsPage,
  toDateRangeFilter,
} from "@/shared/lib/nuqs-parsers";
import type { DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";

export const dashboardFilterParams = {
  preset: parseAsStringLiteral(["today", "7d", "30d", "month", "custom"] as const).withDefault(
    DEFAULT_DASHBOARD_PRESET,
  ),
  from: parseAsDateParam,
  to: parseAsDateParam,
  page: parseAsPage,
} as const;

const getInitialDateRange = () => getDefaultDashboardDateRange();

export const useDashboardFilters = () => {
  const [filters, setFilters] = useQueryStates(dashboardFilterParams);
  const dateRange =
    toDateRangeFilter(filters.from, filters.to) ??
    (filters.preset === DEFAULT_DASHBOARD_PRESET && !filters.from ? getInitialDateRange() : null);

  return {
    preset: filters.preset as DashboardDatePreset,
    dateRange,
    bookingsPage: filters.page,
    setPreset: (preset: DashboardDatePreset) => setFilters({ preset, page: 1 }),
    setDateRange: (value: DateRangeFilterValue | null) => {
      const range = fromDateRangeFilter(value);
      setFilters({
        preset: value ? "custom" : DEFAULT_DASHBOARD_PRESET,
        from: range.from,
        to: range.to,
        page: 1,
      });
    },
    setBookingsPage: (page: number) => setFilters({ page }),
    applyPreset: (preset: Exclude<DashboardDatePreset, "custom">) => {
      const range = getPresetDateRange(preset);
      const parsed = fromDateRangeFilter(range);
      setFilters({
        preset,
        from: parsed.from,
        to: parsed.to,
        page: 1,
      });
    },
  };
};
