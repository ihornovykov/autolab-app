import {
  addDays,
  addMonths,
  addWeeks,
  areIntervalsOverlapping,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from "date-fns";
import { uk } from "date-fns/locale";
import dayjs from "dayjs";

import { type VehicleBookingHistoryItem } from "@/features/booking/lib/types";
import {
  DEFAULT_WORKING_HOURS,
  resolveCalendarSegments,
  type WorkingHoursEntry,
} from "@autolab/api/lib/schedule";

import { DefaultStartHour, WeekCellsHeight, getEventColorClasses } from "@/features/calendar/lib/constants";
import {
  type CalendarEvent,
  type CalendarRange,
  type CalendarView,
  type PositionedCalendarEvent,
} from "@/features/calendar/lib/types";

export { getEventColorClasses };

export const formatMonthYear = (date: Date) => format(date, "LLLL yyyy", { locale: uk });

export const formatMonth = (date: Date) => format(date, "MMM", { locale: uk });

export const formatDayDate = (date: Date) => format(date, "EEEEEE", { locale: uk });

export const getTime = (date: Date): string =>
  date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

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

export const buildSlotStartTime = (date: Date, time?: number) => {
  if (time === undefined) {
    return dayjs(date).hour(DefaultStartHour).minute(0).second(0).format("YYYY-MM-DDTHH:mm");
  }

  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);

  return dayjs(date).hour(hours).minute(minutes).second(0).format("YYYY-MM-DDTHH:mm");
};

const MIN_EVENT_HEIGHT = 24;

type IntervalEvent = {
  event: CalendarEvent;
  start: Date;
  end: Date;
};

export const positionTimedEvents = (
  events: CalendarEvent[],
  options: {
    startHour: number;
    getAdjustedInterval: (event: CalendarEvent) => { start: Date; end: Date };
  },
): PositionedCalendarEvent[] => {
  const sortedEvents = [...events].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );

  const columns: IntervalEvent[][] = [];
  const positioned: Array<PositionedCalendarEvent & { columnIndex: number }> = [];

  sortedEvents.forEach((event) => {
    const { start, end } = options.getAdjustedInterval(event);
    let columnIndex = 0;
    let placed = false;

    while (!placed) {
      const column = columns[columnIndex] ?? [];
      if (column.length === 0) {
        columns[columnIndex] = column;
        placed = true;
      } else {
        const overlaps = column.some((entry) =>
          areIntervalsOverlapping({ start, end }, { start: entry.start, end: entry.end }),
        );
        if (!overlaps) placed = true;
        else columnIndex += 1;
      }
    }

    const column = columns[columnIndex] ?? [];
    columns[columnIndex] = column;
    column.push({ event, start, end });

    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    const top = (startHour - options.startHour) * WeekCellsHeight;
    const height = Math.max((endHour - startHour) * WeekCellsHeight, MIN_EVENT_HEIGHT);

    positioned.push({
      event,
      top,
      height,
      left: 0,
      width: 1,
      zIndex: 10 + columnIndex,
      columnIndex,
    });
  });

  const columnCount = Math.max(columns.length, 1);

  return positioned.map((entry) => ({
    event: entry.event,
    top: entry.top,
    height: entry.height,
    left: entry.columnIndex / columnCount,
    width: 1 / columnCount,
    zIndex: entry.zIndex,
  }));
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

type BookingWithRelations = {
  id: string;
  employeeId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startTime: Date | string;
  endTime: Date | string;
  allowsOvertime?: boolean;
  notes?: string | null;
  totalPrice: string;
  employeeWorkingHours?: WorkingHoursEntry[];
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    licensePlate: string | null;
  };
  employee?: {
    id: string;
    userId: string;
    role: "TECHNICIAN" | "MANAGER" | "OWNER";
    name?: string;
  };
  services?: Array<{
    id: string;
    title: string;
    price?: string;
    unitPrice?: string;
    quantity?: number;
    duration?: number;
  }>;
};

const toCalendarEvent = (
  booking: BookingWithRelations,
  segment: { id: string; startTime: Date; endTime: Date },
  segmentIndex: number,
  segmentCount: number,
): CalendarEvent => ({
  id: segment.id,
  bookingId: booking.id,
  segmentIndex,
  segmentCount,
  startTime: segment.startTime,
  endTime: segment.endTime,
  status: booking.status,
  totalPrice: Number(booking.totalPrice),
  vehicle: {
    id: booking.vehicle?.id ?? "",
    make: booking.vehicle?.make ?? "—",
    model: booking.vehicle?.model ?? "",
    licensePlate: booking.vehicle?.licensePlate ?? null,
  },
});

export const mapBookingsToCalendarEvents = (bookings: BookingWithRelations[]): CalendarEvent[] =>
  bookings.flatMap((booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const schedule = booking.employeeWorkingHours ?? DEFAULT_WORKING_HOURS;
    const segments = resolveCalendarSegments(
      booking.id,
      startTime,
      endTime,
      schedule,
      booking.allowsOvertime ?? false,
    );

    return segments.map((segment, index) =>
      toCalendarEvent(booking, segment, index, segments.length),
    );
  });

export const mapBookingToCalendarEvent = (booking: BookingWithRelations): CalendarEvent =>
  mapBookingsToCalendarEvents([booking])[0]!;

export const mapBookingToHistoryItem = (booking: BookingWithRelations): VehicleBookingHistoryItem => ({
  id: booking.id,
  employeeId: booking.employeeId,
  status: booking.status,
  startTime: new Date(booking.startTime),
  endTime: new Date(booking.endTime),
  allowsOvertime: booking.allowsOvertime ?? false,
  notes: booking.notes,
  totalPrice: booking.totalPrice,
  services: booking.services,
});
