import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { uk } from "date-fns/locale";
import { useEffect, useMemo, useState } from "react";

import { EventGap, EventHeight } from "@/features/calendar/lib/constants";
import { range } from "@/shared/lib/arrays";
import { type CalendarEvent } from "@/features/calendar/lib/types";
import {
  getAllEventsForDay,
  getEventsForDay,
  getSpanningEventsForDay,
  isAllDayEvent,
  sortEvents,
} from "@/features/calendar/lib/utils";
import { useEventVisibility } from "@/features/calendar/hooks/use-event-visibility";
import { DraggableEvent } from "@/features/calendar/ui/draggable-event";
import { DroppableCell } from "@/features/calendar/ui/droppable-cell";
import { EventItem } from "@/features/calendar/ui/event-item";
import { Popover, PopoverContent, PopoverTrigger } from "@autolab/ui/components/popover";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  currentDate: Date;
  events: CalendarEvent[];
};

export const MonthView = ({ currentDate, events }: Props) => {
  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentDate]);

  const weekdays = useMemo(
    () =>
      range(7).map((i) => {
        const date = addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i);
        return format(date, "EEEEEE", { locale: uk });
      }),
    [],
  );

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    let week: Date[] = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]!);
      if (week.length === 7 || i === days.length - 1) {
        result.push(week);
        week = [];
      }
    }

    return result;
  }, [days]);

  const [isMounted, setIsMounted] = useState(true);
  const { contentRef, getVisibleEventCount } = useEventVisibility({
    eventHeight: EventHeight,
    eventGap: EventGap,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div data-slot="month-view" className="contents">
      <div className="grid grid-cols-7 border-b border-border/70">
        {weekdays.map((day, i) => {
          const isTodayWeekday = isToday(addDays(startOfWeek(new Date(), { weekStartsOn: 1 }), i));
          return (
            <div
              key={day}
              className={cn(
                "py-2 text-center text-sm capitalize text-muted-foreground/70",
                isTodayWeekday && "font-semibold text-foreground",
              )}
              data-today={isTodayWeekday || undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
      <div className="h-[calc(100vh-15rem)] overflow-y-auto">
        {weeks.map((week, weekIndex) => (
          <div key={`week-${weekIndex}`} className="grid grid-cols-7 [&:last-child>*]:border-b-0">
            {week.map((day, dayIndex) => {
              const dayEvents = getEventsForDay(events, day);
              const spanningEvents = getSpanningEventsForDay(events, day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const cellId = `month-cell-${day.toISOString()}`;
              const allDayEvents = [...spanningEvents, ...dayEvents];
              const allEvents = getAllEventsForDay(events, day);

              const isReferenceCell = weekIndex === 0 && dayIndex === 0;
              const visibleCount = isMounted
                ? getVisibleEventCount(allDayEvents.length)
                : undefined;
              const hasMore = visibleCount !== undefined && allDayEvents.length > visibleCount;
              const remainingCount = hasMore ? allDayEvents.length - visibleCount : 0;

              return (
                <div
                  key={day.toString()}
                  className="group border-r border-b border-border/70 last:border-r-0 data-outside-cell:bg-muted/25 data-outside-cell:text-muted-foreground/70"
                  data-today={isToday(day) || undefined}
                  data-outside-cell={!isCurrentMonth || undefined}
                >
                  <DroppableCell id={cellId} date={day}>
                    <div className="relative z-10 mt-1 inline-flex size-6 items-center justify-center rounded-full text-sm group-data-today:bg-primary group-data-today:text-primary-foreground">
                      {format(day, "d")}
                    </div>
                    <div
                      ref={isReferenceCell ? contentRef : null}
                      className="relative z-10 min-h-[calc((var(--event-height)+var(--event-gap))*2)] sm:min-h-[calc((var(--event-height)+var(--event-gap))*3)] lg:min-h-[calc((var(--event-height)+var(--event-gap))*4)]"
                    >
                      {sortEvents(allDayEvents).map((event, index) => {
                        const eventStart = new Date(event.startTime);
                        const eventEnd = new Date(event.endTime);
                        const isAllDay = isAllDayEvent(eventStart, eventEnd);
                        const isFirstDay = isSameDay(day, eventStart);
                        const isLastDay = isSameDay(day, eventEnd);
                        const isHidden = isMounted && visibleCount && index >= visibleCount;

                        if (!visibleCount) return null;

                        if (!isFirstDay) {
                          return (
                            <div
                              key={`spanning-${event.id}-${day.toISOString().slice(0, 10)}`}
                              className="aria-hidden:hidden"
                              aria-hidden={isHidden ? "true" : undefined}
                            >
                              <EventItem
                                event={event}
                                view="month"
                                isFirstDay={isFirstDay}
                                isLastDay={isLastDay}
                              >
                                <div className="invisible" aria-hidden>
                                  {!isAllDay && <span>{format(eventStart, "H:mm")} </span>}
                                  {event.vehicle.make} - {event.vehicle.model}
                                </div>
                              </EventItem>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={event.id}
                            className="aria-hidden:hidden"
                            aria-hidden={isHidden ? "true" : undefined}
                          >
                            <DraggableEvent
                              event={event}
                              view="month"
                              isFirstDay={isFirstDay}
                              isLastDay={isLastDay}
                            />
                          </div>
                        );
                      })}

                      {hasMore ? (
                        <Popover>
                          <PopoverTrigger
                            render={
                    <button
                                type="button"
                                className="mt-[var(--event-gap)] flex h-[var(--event-height)] w-full cursor-pointer items-center overflow-hidden px-1 text-left text-[10px] text-muted-foreground backdrop-blur-md transition outline-none select-none hover:bg-muted/50 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 sm:px-2 sm:text-xs"
                              />
                            }
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>
                              + {remainingCount} <span className="max-sm:sr-only">ще</span>
                            </span>
                          </PopoverTrigger>
                          <PopoverContent
                            align="center"
                            className="max-w-52 p-3"
                            style={{ "--event-height": `${EventHeight}px` } as React.CSSProperties}
                          >
                            <div className="space-y-2">
                              <div className="text-sm font-medium">{format(day, "EEE d")}</div>
                              <div className="space-y-1">
                                {sortEvents(allEvents).map((event) => {
                                  const eventStart = new Date(event.startTime);
                                  const eventEnd = new Date(event.endTime);
                                  return (
                                    <EventItem
                                      key={event.id}
                                      event={event}
                                      view="month"
                                      isFirstDay={isSameDay(day, eventStart)}
                                      isLastDay={isSameDay(day, eventEnd)}
                                    />
                                  );
                                })}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ) : null}
                    </div>
                  </DroppableCell>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
