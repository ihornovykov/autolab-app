import { defaultWorkingHoursDays } from "@/features/profile/lib/constants";
import type { WorkingHoursDay } from "@/features/profile/lib/types";

export const toTimeInputValue = (value: string | null | undefined) => {
  if (!value) return "";
  return value.slice(0, 5);
};

export const mapApiWorkingHoursDays = (rows: WorkingHoursDay[]) =>
  defaultWorkingHoursDays.map((fallback) => {
    const row = rows.find((item) => item.weekday === fallback.weekday);
    if (!row) return fallback;

    return {
      weekday: row.weekday,
      openTime: toTimeInputValue(row.openTime) || fallback.openTime,
      closeTime: toTimeInputValue(row.closeTime) || fallback.closeTime,
      isClosed: row.isClosed,
    };
  });

export const toWorkingHoursMutationInput = (days: WorkingHoursDay[]) =>
  days.map((day) => ({
    weekday: day.weekday,
    isClosed: day.isClosed,
    openTime: day.isClosed ? null : day.openTime,
    closeTime: day.isClosed ? null : day.closeTime,
  }));
