import dayjs from "dayjs";
import { createParser, parseAsStringLiteral, useQueryStates } from "nuqs";

import type { CalendarView } from "@/features/calendar/lib/types";

const parseAsCalendarDateParam = createParser({
  parse: (value) => {
    const normalized = value.replace(/^"|"$/g, "");
    const strict = dayjs(normalized, "YYYY-MM-DD", true);
    if (strict.isValid()) return strict.format("YYYY-MM-DD");
    const iso = dayjs(normalized);
    if (iso.isValid()) return iso.format("YYYY-MM-DD");
    return null;
  },
  serialize: (value) => value,
});

export const calendarFilterParams = {
  view: parseAsStringLiteral(["month", "week", "day"] as const).withDefault("week"),
  date: parseAsCalendarDateParam,
} as const;

export const useCalendarFilters = () => {
  const [filters, setFilters] = useQueryStates(calendarFilterParams);
  const currentDate = filters.date ? dayjs(filters.date, "YYYY-MM-DD").toDate() : new Date();

  return {
    view: filters.view as CalendarView,
    currentDate,
    setView: (view: CalendarView) => setFilters({ view }),
    setCurrentDate: (date: Date) => setFilters({ date: dayjs(date).format("YYYY-MM-DD") }),
  };
};
