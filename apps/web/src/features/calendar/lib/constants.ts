import { type BookingStatus, type CalendarView } from "@/features/calendar/lib/types";

export const EventHeight = 24;

export const EventGap = 4;

export const WeekCellsHeight = 64;

export const StartHour = 0;

export const EndHour = 24;

export const DefaultStartHour = 9;

export const DefaultEndHour = 10;

export const VIEW_TYPE: Record<CalendarView, string> = {
  month: "Місяць",
  week: "Тиждень",
  day: "День",
};

export const VIEW_TYPES = Object.keys(VIEW_TYPE) as CalendarView[];

export const KEYBOARD_SHORTCUTS: Record<string, CalendarView> = {
  m: "month",
  w: "week",
  d: "day",
};

export const STATUS_EVENT_COLORS: Record<BookingStatus, string> = {
  COMPLETED: "bg-emerald-500/65 border-emerald-500/65 text-white",
  IN_PROGRESS: "bg-blue-500/65 border-blue-500/65 text-white",
  PENDING: "bg-amber-500/65 border-amber-500/65 text-white",
  CANCELLED: "bg-red-500/65 border-red-500/65 text-white",
};

export const CONTINUATION_EVENT_COLORS: Record<BookingStatus, string> = {
  COMPLETED: "bg-emerald-500/10 border-emerald-500 text-emerald-700 border-dashed",
  IN_PROGRESS: "bg-blue-500/10 border-blue-500 text-blue-700 border-dashed",
  PENDING: "bg-amber-500/10 border-amber-500 text-amber-800 border-dashed",
  CANCELLED: "bg-red-500/10 border-red-500 text-red-700 border-dashed",
};

export const getEventColorClasses = (
  status: BookingStatus,
  options?: { isContinuation?: boolean },
): string =>
  options?.isContinuation ? CONTINUATION_EVENT_COLORS[status] : STATUS_EVENT_COLORS[status];
