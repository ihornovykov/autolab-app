import dayjs from "dayjs";

import type { DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";

export type DashboardDatePreset = "today" | "7d" | "30d" | "month" | "custom";

export const DASHBOARD_DATE_PRESETS: Array<{ id: DashboardDatePreset; label: string }> = [
  { id: "today", label: "Сьогодні" },
  { id: "7d", label: "7 днів" },
  { id: "30d", label: "30 днів" },
  { id: "month", label: "Цей місяць" },
];

export const getPresetDateRange = (preset: Exclude<DashboardDatePreset, "custom">): DateRangeFilterValue => {
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

export const DEFAULT_DASHBOARD_PRESET: Exclude<DashboardDatePreset, "custom"> = "7d";

export const getDefaultDashboardDateRange = () => getPresetDateRange(DEFAULT_DASHBOARD_PRESET);
