import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { differenceInMinutes, isPast } from "date-fns";
import { CornerDownRight } from "lucide-react";
import { useMemo } from "react";

import { getTime } from "@/features/calendar/lib/date-format";
import { type CalendarEvent } from "@/features/calendar/lib/types";
import {
  getBorderRadiusClasses,
  getEventColorClasses,
  isAllDayEvent,
} from "@/features/calendar/lib/utils";
import { useCalendarActions } from "@/features/calendar/ui/calendar-actions-context";
import { cn } from "@autolab/ui/lib/utils";

type EventWrapperProps = {
  event: CalendarEvent;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
  currentTime?: Date;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
};

const EventWrapper = ({
  event,
  isFirstDay = true,
  isLastDay = true,
  isDragging,
  onClick,
  className,
  children,
  currentTime,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventWrapperProps) => {
  const { onEventClick, hoveredBookingId, setHoveredBookingId } = useCalendarActions();

  const displayEnd = currentTime
    ? new Date(
        currentTime.getTime() +
          (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()),
      )
    : new Date(event.endTime);

  const isEventInPast = isPast(displayEnd);
  const isLinkedHovered = hoveredBookingId === event.bookingId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEventClick(event.id);
    onClick?.(e);
  };

  return (
    <button
      type="button"
      data-calendar-event
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 flex size-full cursor-pointer overflow-hidden border px-1 text-left font-medium backdrop-blur-md transition outline-none select-none focus-visible:ring-[3px] data-dragging:cursor-grabbing data-dragging:shadow-lg data-past-event:line-through sm:px-2",
        getEventColorClasses(event.status),
        getBorderRadiusClasses(isFirstDay, isLastDay),
        isLinkedHovered && "z-20 scale-[1.01] shadow-lg",
        className,
      )}
      data-dragging={isDragging || undefined}
      data-past-event={isEventInPast || undefined}
      onClick={handleClick}
      onMouseEnter={() => setHoveredBookingId(event.bookingId)}
      onMouseLeave={() => setHoveredBookingId(null)}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      {...dndListeners}
      {...dndAttributes}
    >
      {children}
    </button>
  );
};

type EventItemProps = {
  event: CalendarEvent;
  view: "month" | "week" | "day";
  isDragging?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  showTime?: boolean;
  currentTime?: Date;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  children?: React.ReactNode;
  className?: string;
  dndListeners?: SyntheticListenerMap;
  dndAttributes?: DraggableAttributes;
  onMouseDown?: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
};

export const EventItem = ({
  event,
  view,
  isDragging,
  onClick,
  showTime,
  currentTime,
  isFirstDay = true,
  isLastDay = true,
  children,
  className,
  dndListeners,
  dndAttributes,
  onMouseDown,
  onTouchStart,
}: EventItemProps) => {
  const displayStart = useMemo(
    () => currentTime ?? new Date(event.startTime),
    [currentTime, event.startTime],
  );

  const displayEnd = useMemo(() => {
    if (!currentTime) return new Date(event.endTime);
    return new Date(
      currentTime.getTime() +
        (new Date(event.endTime).getTime() - new Date(event.startTime).getTime()),
    );
  }, [currentTime, event.startTime, event.endTime]);

  const isAllDay = isAllDayEvent(displayStart, displayEnd);

  const durationMinutes = useMemo(
    () => differenceInMinutes(displayEnd, displayStart),
    [displayStart, displayEnd],
  );

  const getEventTime = () => {
    if (isAllDay) return "День";
    return `${getTime(displayStart)} - ${getTime(displayEnd)}`;
  };

  const vehicleLabel = `${event.vehicle.make} - ${event.vehicle.model}`;
  const isSplitSegment = event.segmentCount > 1;

  const splitIndicator =
    isSplitSegment && event.segmentIndex > 0 ? (
      <CornerDownRight
        className="size-3 shrink-0 opacity-80"
        aria-label="Продовження запису з іншого дня"
      />
    ) : null;

  if (view === "month") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "mt-[var(--event-gap)] h-[var(--event-height)] items-center text-[10px] sm:text-xs",
          className,
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {children ?? (
          <span className="flex min-w-0 items-center gap-1 truncate">
            {splitIndicator}
            <span className="truncate">
              {!isAllDay && (
                <span className="truncate font-normal opacity-70 sm:text-[11px]">
                  {getTime(displayStart)}{" "}
                </span>
              )}
              {vehicleLabel}
            </span>
          </span>
        )}
      </EventWrapper>
    );
  }

  if (view === "week" || view === "day") {
    return (
      <EventWrapper
        event={event}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        className={cn(
          "z-10 py-1 shadow-sm",
          durationMinutes < 45 ? "items-center" : "flex-col",
          view === "week" ? "text-[10px] sm:text-xs" : "text-xs",
          className,
        )}
        currentTime={currentTime}
        dndListeners={dndListeners}
        dndAttributes={dndAttributes}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
      >
        {durationMinutes < 45 ? (
          <div className="flex min-w-0 items-center gap-1 truncate">
            {splitIndicator}
            <span className="truncate">
              {vehicleLabel}{" "}
              {showTime && <span className="opacity-70">{getTime(displayStart)}</span>}
            </span>
          </div>
        ) : (
          <>
            <div className="flex min-w-0 items-center gap-1 truncate font-medium">
              {splitIndicator}
              <span className="truncate">{vehicleLabel}</span>
            </div>
            {showTime && (
              <div className="truncate font-normal opacity-70 sm:text-[11px]">{getEventTime()}</div>
            )}
          </>
        )}
      </EventWrapper>
    );
  }

  return null;
};
