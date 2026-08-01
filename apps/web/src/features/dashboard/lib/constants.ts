import type { DashboardDatePreset } from "@/features/dashboard/lib/types";

export const DASHBOARD_DATE_PRESETS: Array<{ id: DashboardDatePreset; label: string }> = [
  { id: "today", label: "Сьогодні" },
  { id: "7d", label: "7 днів" },
  { id: "30d", label: "30 днів" },
  { id: "month", label: "Цей місяць" },
];

export const DEFAULT_DASHBOARD_PRESET: Exclude<DashboardDatePreset, "custom"> = "7d";
