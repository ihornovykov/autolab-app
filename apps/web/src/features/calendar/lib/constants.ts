import { type CalendarView } from "@/features/calendar/lib/types";

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
