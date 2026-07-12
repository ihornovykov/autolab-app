import { useDroppable } from "@dnd-kit/core";

import { useCalendarActions } from "@/features/calendar/ui/calendar-actions-context";
import { useCalendarDnd } from "@/features/calendar/ui/calendar-dnd-context";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  id: string;
  date: Date;
  time?: number;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export const DroppableCell = ({ id, date, time, children, className, onClick }: Props) => {
  const { onSlotClick } = useCalendarActions();
  const { activeEvent } = useCalendarDnd();

  const { setNodeRef, isOver } = useDroppable({
    id,
    data: { date, time },
  });

  const isTimedSlot = time !== undefined;

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (activeEvent) return;
    if ((event.target as HTMLElement).closest("[data-calendar-event]")) return;

    onClick?.();
    onSlotClick(date, time);
  };

  return (
    <div
      ref={setNodeRef}
      onClick={handleClick}
      className={cn(
        "group/slot relative",
        isTimedSlot
          ? "cursor-pointer"
          : "flex h-full cursor-pointer flex-col overflow-hidden px-0.5 py-1 hover:bg-primary/5 sm:px-1",
        "data-dragging:bg-accent",
        className,
      )}
      data-dragging={isOver && activeEvent ? true : undefined}
    >
      {isTimedSlot ? (
        <div className="pointer-events-none absolute inset-0.5 rounded-sm border border-transparent transition group-hover/slot:border-primary/60 group-hover/slot:bg-primary/10" />
      ) : (
        <div className="pointer-events-none absolute inset-1 rounded-sm border border-transparent transition group-hover/slot:border-primary/50 group-hover/slot:bg-primary/8" />
      )}
      {children}
    </div>
  );
};
