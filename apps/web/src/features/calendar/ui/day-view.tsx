import { addHours, eachHourOfInterval, getHours, isSameDay, startOfDay } from "date-fns";
import { useEffect, useMemo, useRef } from "react";

import { EndHour, StartHour, WeekCellsHeight } from "@/features/calendar/lib/constants";
import { getTime } from "@/features/calendar/lib/utils";
import { positionTimedEvents } from "@/features/calendar/lib/utils";
import { type CalendarEvent } from "@/features/calendar/lib/types";
import { useCurrentTimeIndicator } from "@/features/calendar/hooks/use-current-time-indicator";
import { DraggableEvent } from "@/features/calendar/ui/draggable-event";
import { DroppableCell } from "@/features/calendar/ui/droppable-cell";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  currentDate: Date;
  events: CalendarEvent[];
};

export const DayView = ({ currentDate, events }: Props) => {
  const hours = useMemo(() => {
    const dayStart = startOfDay(currentDate);
    return eachHourOfInterval({
      start: addHours(dayStart, StartHour),
      end: addHours(dayStart, EndHour - 1),
    });
  }, [currentDate]);

  const dayEvents = useMemo(
    () =>
      events
        .filter((event) => isSameDay(currentDate, new Date(event.startTime)))
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [currentDate, events],
  );

  const positionedEvents = useMemo(
    () =>
      positionTimedEvents(dayEvents, {
        startHour: StartHour,
        getAdjustedInterval: (event) => ({
          start: new Date(event.startTime),
          end: new Date(event.endTime),
        }),
      }),
    [dayEvents],
  );

  const { currentTimePosition, currentTimeVisible } = useCurrentTimeIndicator(currentDate, "day");

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollToEightAM = () => {
      if (!scrollContainerRef.current) return;
      const targetTop = (8 - StartHour) * WeekCellsHeight;
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = targetTop;
      });
    };

    const timeoutId = setTimeout(scrollToEightAM, 100);
    return () => clearTimeout(timeoutId);
  }, [currentDate]);

  return (
    <div data-slot="day-view" className="contents">
      <div ref={scrollContainerRef} className="h-[calc(100vh-12.5rem)] overflow-y-auto">
        <div className="grid flex-1 grid-cols-[3rem_1fr] overflow-hidden rounded-sm border-t border-border/70 sm:grid-cols-[4rem_1fr]">
          <div>
            {hours.map((hour, index) => (
              <div
                key={hour.toString()}
                className="relative h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
              >
                {index > 0 ? (
                  <span className="absolute -top-3 left-0 flex h-6 w-16 max-w-full items-center justify-end bg-background pe-2 text-[10px] text-muted-foreground/70 sm:pe-4 sm:text-xs">
                    {getTime(hour)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>

          <div className="relative overflow-hidden">
            {positionedEvents.map((positionedEvent) => (
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
                    view="day"
                    showTime
                    height={positionedEvent.height}
                  />
                </div>
              </div>
            ))}

            {currentTimeVisible ? (
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
                  className="relative h-[var(--week-cells-height)] border-b border-border/70 last:border-b-0"
                >
                  {[0, 1, 2, 3].map((quarter) => {
                    const quarterHourTime = hourValue + quarter * 0.25;
                    return (
                      <DroppableCell
                        key={`${hour.toString()}-${quarter}`}
                        id={`day-cell-${currentDate.toISOString()}-${quarterHourTime}`}
                        date={currentDate}
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
        </div>
      </div>
    </div>
  );
};
