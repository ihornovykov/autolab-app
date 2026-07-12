import { areIntervalsOverlapping } from "date-fns";

import { WeekCellsHeight } from "@/features/calendar/lib/constants";
import { type CalendarEvent } from "@/features/calendar/lib/types";

const MIN_EVENT_HEIGHT = 24;

export type PositionedCalendarEvent = {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
};

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
