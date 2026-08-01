import dayjs from "dayjs";

import type { DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";

import { DEFAULT_DASHBOARD_PRESET } from "@/features/dashboard/lib/constants";
import type { DashboardDatePreset } from "@/features/dashboard/lib/types";

export const getPresetDateRange = (
  preset: Exclude<DashboardDatePreset, "custom">,
): DateRangeFilterValue => {
  const today = dayjs().format("YYYY-MM-DD");

  if (preset === "today") {
    return { from: today, to: today };
  }

  if (preset === "7d") {
    return {
      from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
      to: today,
    };
  }

  if (preset === "30d") {
    return {
      from: dayjs().subtract(29, "day").format("YYYY-MM-DD"),
      to: today,
    };
  }

  return {
    from: dayjs().startOf("month").format("YYYY-MM-DD"),
    to: today,
  };
};

export const getDefaultDashboardDateRange = () => getPresetDateRange(DEFAULT_DASHBOARD_PRESET);
