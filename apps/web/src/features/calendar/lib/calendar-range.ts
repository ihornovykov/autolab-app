import {
  addDays,
  addMonths,
  addWeeks,
  endOfDay,
  endOfMonth,
  endOfWeek,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";

import { type CalendarView } from "@/features/calendar/lib/types";

export type CalendarRange = {
  from: string;
  to: string;
};

export const getCalendarFetchRange = (view: CalendarView, currentDate: Date): CalendarRange => {
  if (view === "day") {
    return {
      from: startOfDay(currentDate).toISOString(),
      to: endOfDay(currentDate).toISOString(),
    };
  }

  if (view === "week") {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return {
      from: start.toISOString(),
      to: end.toISOString(),
    };
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return {
    from: calendarStart.toISOString(),
    to: calendarEnd.toISOString(),
  };
};

const shiftCalendarDate = (view: CalendarView, currentDate: Date, direction: -1 | 1) => {
  if (view === "day") return addDays(currentDate, direction);
  if (view === "week")
    return direction === -1 ? subWeeks(currentDate, 1) : addWeeks(currentDate, 1);
  return direction === -1 ? subMonths(currentDate, 1) : addMonths(currentDate, 1);
};

export const getAdjacentCalendarRanges = (
  view: CalendarView,
  currentDate: Date,
): { previous: CalendarRange; next: CalendarRange } => ({
  previous: getCalendarFetchRange(view, shiftCalendarDate(view, currentDate, -1)),
  next: getCalendarFetchRange(view, shiftCalendarDate(view, currentDate, 1)),
});

export const getExtendedCalendarPrefetchRanges = (
  view: CalendarView,
  currentDate: Date,
): CalendarRange[] => {
  const adjacent = getAdjacentCalendarRanges(view, currentDate);
  const previousPrevious = getCalendarFetchRange(
    view,
    shiftCalendarDate(view, shiftCalendarDate(view, currentDate, -1), -1),
  );
  const nextNext = getCalendarFetchRange(
    view,
    shiftCalendarDate(view, shiftCalendarDate(view, currentDate, 1), 1),
  );

  return [adjacent.previous, adjacent.next, previousPrevious, nextNext];
};

export const createCalendarBookingsInput = (organizationId: string, range: CalendarRange) => ({
  organizationId,
  from: range.from,
  to: range.to,
  includeCancelled: false,
  page: 1,
  pageSize: 500,
  sort: "asc" as const,
});
