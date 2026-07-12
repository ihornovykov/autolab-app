import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { differenceInDays } from "date-fns";
import { useRef, useState } from "react";

import { type CalendarEvent } from "@/features/calendar/lib/types";
import { isAllDayEvent } from "@/features/calendar/lib/utils";
import { EventItem } from "@/features/calendar/ui/event-item";
import { useCalendarDnd } from "./calendar-dnd-context";

type Props = {
  event: CalendarEvent;
  view: "month" | "week" | "day";
  showTime?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  height?: number;
  isMultiDay?: boolean;
  multiDayWidth?: number;
  isFirstDay?: boolean;
  isLastDay?: boolean;
};

export const DraggableEvent = ({
  event,
  view,
  showTime,
  onClick,
  height,
  isMultiDay,
  multiDayWidth,
  isFirstDay = true,
  isLastDay = true,
}: Props) => {
  const { activeId } = useCalendarDnd();
  const elementRef = useRef<HTMLDivElement | null>(null);
  const [dragHandlePosition, setDragHandlePosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const allDay = isAllDayEvent(event.startTime, event.endTime);
  const eventStart = new Date(event.startTime);
  const eventEnd = new Date(event.endTime);
  const isMultiDayEvent = isMultiDay ?? allDay ?? differenceInDays(eventEnd, eventStart) >= 1;

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `${event.id}-${view}`,
    data: {
      event,
      view,
      height: height ?? elementRef.current?.offsetHeight ?? null,
      isMultiDay: isMultiDayEvent,
      multiDayWidth,
      dragHandlePosition,
      isFirstDay,
      isLastDay,
    },
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    setDragHandlePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!elementRef.current) return;
    const rect = elementRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    if (!touch) return;
    setDragHandlePosition({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
  };

  if (isDragging || activeId === `${event.id}-${view}`) {
    return <div ref={setNodeRef} className="opacity-0" style={{ height: height ?? "auto" }} />;
  }

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        height: height ?? "auto",
        width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      }
    : {
        height: height ?? "auto",
        width: isMultiDayEvent && multiDayWidth ? `${multiDayWidth}%` : undefined,
      };

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        elementRef.current = node;
      }}
      style={style}
      className="touch-none"
    >
      <EventItem
        event={event}
        view={view}
        showTime={showTime}
        isFirstDay={isFirstDay}
        isLastDay={isLastDay}
        isDragging={isDragging}
        onClick={onClick}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        dndListeners={listeners}
        dndAttributes={attributes}
      />
    </div>
  );
};
