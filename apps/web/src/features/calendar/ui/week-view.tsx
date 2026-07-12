import {
  addHours,
  eachDayOfInterval,
  eachHourOfInterval,
  endOfWeek,
  getHours,
  isSameDay,
  isToday,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { useEffect, useMemo, useRef } from "react";

import { EndHour, StartHour } from "@/features/calendar/lib/constants";
import { formatDayDate, getTime } from "@/features/calendar/lib/date-format";
import { positionTimedEvents } from "@/features/calendar/lib/position-timed-events";
import { type CalendarEvent } from "@/features/calendar/lib/types";
import { useCurrentTimeIndicator } from "@/features/calendar/hooks/use-current-time-indicator";
import { DraggableEvent } from "@/features/calendar/ui/draggable-event";
import { DroppableCell } from "@/features/calendar/ui/droppable-cell";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  currentDate: Date;
  events: CalendarEvent[];
};

export const WeekView = ({ currentDate, events }: Props) => {
  const days = useMemo(() => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: weekStart, end: weekEnd });
  }, [currentDate]);

  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [currentDate]);

  const processedDayEvents = useMemo(
    () =>
      days.map((day) => {
        const dayEvents = events.filter((event) => isSameDay(day, new Date(event.startTime)));

        return positionTimedEvents(dayEvents, {
          startHour: StartHour,
          getAdjustedInterval: (event) => ({
            start: new Date(event.startTime),
            end: new Date(event.endTime),
          }),
        });
      }),
    [days, events],
  );

  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "week");

  useEffect(() => {
    scrollAreaRef.current?.scrollTo({ top: 8.5 * 60, behavior: "smooth" });
  }, []);

  return (
    <div data-slot="week-view" className="flex h-[calc(100vh-12.5rem)] flex-col">
      <div className="sticky top-0 z-30 grid grid-cols-[auto_repeat(7,minmax(0,1fr))] border-b border-border/70 bg-background/80 backdrop-blur-md">
        <div className="w-12 py-2 text-muted-foreground/70" />
        {days.map((day) => (
          <div
            key={day.toString()}
            className="flex flex-row items-center justify-center gap-1 py-2 text-center text-sm data-today:font-medium data-today:text-foreground"
            data-today={isToday(day) || undefined}
          >
            <span
              className={cn(
                isToday(day) && "rounded-sm bg-primary/80 px-1.5 py-1 text-primary-foreground",
              )}
            >
              {day.getDate()}
            </span>
            <span className="max-sm:hidden capitalize text-foreground/70">
              {formatDayDate(day)}
            </span>
          </div>
        ))}
      </div>

      <div ref={scrollAreaRef} className="h-full w-full overflow-y-auto overflow-x-hidden">
        <div className="grid flex-1 grid-cols-[auto_repeat(7,minmax(0,1fr))] overflow-hidden">
          <div className="w-12 border-r border-border/70">
            {hours.map((hour) => (
              <div
                key={hour.toString()}
                className="relative grid min-h-[var(--week-cells-height)] place-items-center border-b border-border/70 last:border-b-0"
              >
                <span className="flex h-6 w-10 max-w-full items-center justify-center bg-background text-[10px] text-muted-foreground/70">
                  {getTime(hour)}
                </span>
              </div>
            ))}
          </div>

          {days.map((day, dayIndex) => (
            <div
              key={day.toString()}
              className="relative grid w-full auto-cols-fr overflow-hidden border-r border-border/70 last:border-r-0"
              data-today={isToday(day) || undefined}
            >
              {(processedDayEvents[dayIndex] ?? []).map((positionedEvent) => (
                <div
                  key={positionedEvent.event.id}
                  className="absolute z-10 px-0.5"
                  style={{
                    top: `${positionedEvent.top}px`,
                    height: `${positionedEvent.height}px`,
                    left: `${positionedEvent.left * 100}%`,
                    width: `${positionedEvent.width * 100}%`,
                    zIndex: positionedEvent.zIndex,
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="size-full">
                    <DraggableEvent
                      event={positionedEvent.event}
                      view="week"
                      showTime
                      height={positionedEvent.height}
                    />
                  </div>
                </div>
              ))}

              {currentTimeVisible && isToday(day) ? (
                <div
                  className="pointer-events-none absolute right-0 left-0 z-20"
                  style={{ top: `${currentTimePosition}%` }}
                >
                  <div className="relative flex items-center">
                    <div className="absolute -left-1 size-2 rounded-full bg-primary" />
                    <div className="h-[2px] w-full bg-primary" />
                  </div>
                </div>
              ) : null}

              {hours.map((hour) => {
                const hourValue = getHours(hour);
                return (
                  <div
                    key={hour.toString()}
                    className="relative min-h-[var(--week-cells-height)] w-full border-b border-border/70 last:border-b-0"
                  >
                    {[0, 1, 2, 3].map((quarter) => {
                      const quarterHourTime = hourValue + quarter * 0.25;
                      return (
                        <DroppableCell
                          key={`${hour.toString()}-${quarter}`}
                          id={`week-cell-${day.toISOString()}-${quarterHourTime}`}
                          date={day}
                          time={quarterHourTime}
                          className={cn(
                            "absolute h-[calc(var(--week-cells-height)/4)] w-full",
                            quarter === 0 && "top-0",
                            quarter === 1 && "top-[calc(var(--week-cells-height)/4)]",
                            quarter === 2 && "top-[calc(var(--week-cells-height)/4*2)]",
                            quarter === 3 && "top-[calc(var(--week-cells-height)/4*3)]",
                          )}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
