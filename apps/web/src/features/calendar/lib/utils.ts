import {
  addDays,
  addMonths,
  addWeeks,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { uk } from "date-fns/locale";

import { formatMonth, formatMonthYear } from "@/features/calendar/lib/date-format";
import { getEventColorClasses } from "@/features/calendar/lib/event-colors";
import { type CalendarEvent, type CalendarView } from "@/features/calendar/lib/types";

export { getEventColorClasses };

export const getBorderRadiusClasses = (isFirstDay: boolean, isLastDay: boolean): string => {
  if (isFirstDay && isLastDay) return "rounded";
  if (isFirstDay) return "rounded-l rounded-r-none";
  if (isLastDay) return "rounded-r rounded-l-none";
  return "rounded-none";
};

export const isAllDayEvent = (startTime: Date, endTime: Date): boolean => {
  if (!isSameDay(startTime, endTime)) return false;

  const isStartAtMidnight =
    startTime.getHours() === 0 &&
    startTime.getMinutes() === 0 &&
    startTime.getSeconds() === 0 &&
    startTime.getMilliseconds() === 0;

  const isEndAtMidnight =
    endTime.getHours() === 23 && endTime.getMinutes() === 59 && endTime.getSeconds() === 59;

  return isStartAtMidnight && isEndAtMidnight;
};

export const isMultiDayEvent = (event: CalendarEvent): boolean => {
  const eventStart = new Date(event.startTime);
  const eventEnd = new Date(event.endTime);
  const allDay = isAllDayEvent(eventStart, eventEnd);
  return allDay || eventStart.getDate() !== eventEnd.getDate();
};

export const getEventsForDay = (events: CalendarEvent[], day: Date): CalendarEvent[] =>
  events
    .filter((event) => isSameDay(day, new Date(event.startTime)))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

export const sortEvents = (events: CalendarEvent[]): CalendarEvent[] =>
  [...events].sort((a, b) => {
    const aIsMultiDay = isMultiDayEvent(a);
    const bIsMultiDay = isMultiDayEvent(b);

    if (aIsMultiDay && !bIsMultiDay) return -1;
    if (!aIsMultiDay && bIsMultiDay) return 1;

    return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
  });

export const getSpanningEventsForDay = (events: CalendarEvent[], day: Date): CalendarEvent[] =>
  events.filter((event) => {
    if (!isMultiDayEvent(event)) return false;

    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);

    return (
      !isSameDay(day, eventStart) &&
      (isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd))
    );
  });

export const getAllEventsForDay = (events: CalendarEvent[], day: Date): CalendarEvent[] =>
  events.filter((event) => {
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    return (
      isSameDay(day, eventStart) || isSameDay(day, eventEnd) || (day > eventStart && day < eventEnd)
    );
  });

export const addHoursToDate = (date: Date, hours: number): Date => {
  const result = new Date(date);
  result.setHours(result.getHours() + hours);
  return result;
};

const viewTitleFormatters: Record<CalendarView, (date: Date) => string> = {
  month: (date) => formatMonthYear(date),
  week: (date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });
    return isSameMonth(start, end)
      ? formatMonthYear(start)
      : `${formatMonth(start)} - ${formatMonthYear(end)}`;
  },
  day: (date) => format(date, "EEEE, d MMMM yyyy", { locale: uk }),
};

export const getViewTitle = (view: CalendarView, date: Date): string => {
  const formatter = viewTitleFormatters[view] ?? viewTitleFormatters.month;
  return formatter(date);
};

export const viewHandlers = {
  month: {
    previous: (date: Date) => subMonths(date, 1),
    next: (date: Date) => addMonths(date, 1),
  },
  week: {
    previous: (date: Date) => subWeeks(date, 1),
    next: (date: Date) => addWeeks(date, 1),
  },
  day: {
    previous: (date: Date) => addDays(date, -1),
    next: (date: Date) => addDays(date, 1),
  },
};
