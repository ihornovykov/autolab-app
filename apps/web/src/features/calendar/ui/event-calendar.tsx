import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo } from "react";
import { toast } from "sonner";

import { mapBookingToHistoryItem } from "@/features/calendar/lib/map-booking";
import { BookingPreviewSheet } from "@/features/booking/ui/booking-preview-sheet";
import {
  EventGap,
  EventHeight,
  KEYBOARD_SHORTCUTS,
  VIEW_TYPE,
  WeekCellsHeight,
} from "@/features/calendar/lib/constants";
import { buildSlotStartTime } from "@/features/calendar/lib/build-slot-start-time";
import { type CalendarEvent, type CalendarView } from "@/features/calendar/lib/types";
import { getViewTitle, viewHandlers } from "@/features/calendar/lib/utils";
import { useCalendarStore } from "@/features/calendar/model/calendar-store";
import { CalendarActionsProvider } from "@/features/calendar/ui/calendar-actions-context";
import { CalendarDndProvider } from "@/features/calendar/ui/calendar-dnd-context";
import { CreateBookingDialog } from "@/features/calendar/ui/create-booking-dialog";
import { EventCalendarViewSkeleton } from "@/features/calendar/ui/event-calendar-skeleton";
import { DayView } from "@/features/calendar/ui/day-view";
import { MonthView } from "@/features/calendar/ui/month-view";
import { WeekView } from "@/features/calendar/ui/week-view";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { Button } from "@autolab/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@autolab/ui/components/dropdown-menu";
import { cn } from "@autolab/ui/lib/utils";

type BookingWithRelations = Parameters<typeof mapBookingToHistoryItem>[0];

type Props = {
  events: CalendarEvent[];
  bookings: BookingWithRelations[];
  organizationId: string;
  isLoading: boolean;
  className?: string;
};

export const EventCalendar = ({
  events,
  bookings,
  organizationId,
  isLoading,
  className,
}: Props) => {
  const queryClient = useQueryClient();
  const view = useCalendarStore((state) => state.view);
  const currentDate = useCalendarStore((state) => state.currentDate);
  const setView = useCalendarStore((state) => state.setView);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);

  const bookingsById = useMemo(
    () => new Map(bookings.map((booking) => [booking.id, booking])),
    [bookings],
  );

  const eventsById = useMemo(() => new Map(events.map((event) => [event.id, event])), [events]);

  const updateMutation = useMutation(
    orpc.booking.updateBooking.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
        toast.success("Запис оновлено");
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити запис");
      },
    }),
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable)
      ) {
        return;
      }

      if (Object.keys(KEYBOARD_SHORTCUTS).includes(key)) {
        setView(KEYBOARD_SHORTCUTS[key] as CalendarView);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [setView]);

  const handlePrevious = () => {
    setCurrentDate(viewHandlers[view].previous(currentDate));
  };

  const handleNext = () => {
    setCurrentDate(viewHandlers[view].next(currentDate));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleCreateClick = () => {
    dialogs.open(<CreateBookingDialog organizationId={organizationId} />);
  };

  const handleSlotClick = useCallback(
    (date: Date, time?: number) => {
      dialogs.open(
        <CreateBookingDialog
          organizationId={organizationId}
          initialStartTime={buildSlotStartTime(date, time)}
        />,
      );
    },
    [organizationId],
  );

  const handleEventClick = useCallback(
    (eventId: string) => {
      const event = eventsById.get(eventId);
      if (!event?.bookingId) return;

      const booking = bookingsById.get(event.bookingId);
      if (!booking) return;

      sheets.open(
        <BookingPreviewSheet
          booking={booking}
          bookingId={event.bookingId}
          organizationId={organizationId}
          calendarEvent={event}
        />,
      );
    },
    [bookingsById, eventsById, organizationId],
  );

  const handleEventUpdate = useCallback(
    ({ id, startTime, endTime }: { id: string; startTime: Date; endTime: Date }) => {
      const event = eventsById.get(id);
      const bookingId = event?.bookingId ?? id;

      if (!bookingsById.has(bookingId)) return;

      updateMutation.mutate({
        organizationId,
        bookingId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      });
    },
    [bookingsById, eventsById, organizationId, updateMutation],
  );

  const viewTitle = useMemo(() => getViewTitle(view, currentDate), [view, currentDate]);

  return (
    <CalendarActionsProvider onEventClick={handleEventClick} onSlotClick={handleSlotClick}>
      <div
        className="relative flex h-full min-h-0 flex-col rounded-lg border has-data-[slot=month-view]:flex-1"
        style={
          {
            "--event-height": `${EventHeight}px`,
            "--event-gap": `${EventGap}px`,
            "--week-cells-height": `${WeekCellsHeight}px`,
          } as React.CSSProperties
        }
      >
        {isLoading ? (
          <div className="absolute inset-x-0 bottom-0 top-[4.5rem] z-10 overflow-hidden bg-background/60 p-2 sm:top-[5.5rem] sm:p-4">
            <EventCalendarViewSkeleton view={view} />
          </div>
        ) : null}

        <CalendarDndProvider onEventUpdate={handleEventUpdate}>
          <div className={cn("flex items-center justify-between p-2 sm:p-4", className)}>
            <div className="flex items-center gap-1 sm:gap-4">
              <Button
                variant="outline"
                size="icon"
                className="max-[479px]:aspect-square max-[479px]:p-0!"
                onClick={handleToday}
              >
                <CalendarCheckIcon className="size-4" aria-hidden />
              </Button>
              <div className="flex items-center sm:gap-2">
                <Button variant="ghost" size="icon" onClick={handlePrevious} aria-label="Назад">
                  <ChevronLeftIcon className="size-4" aria-hidden />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Вперед">
                  <ChevronRightIcon className="size-4" aria-hidden />
                </Button>
              </div>
              <h2 className="text-sm font-semibold capitalize sm:text-lg md:text-xl">
                {viewTitle}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button variant="outline" className="gap-1.5 max-[479px]:h-8">
                      <span>
                        <span className="min-[480px]:hidden" aria-hidden>
                          {VIEW_TYPE[view].charAt(0).toUpperCase()}
                        </span>
                        <span className="max-[479px]:sr-only capitalize">{VIEW_TYPE[view]}</span>
                      </span>
                      <ChevronDownIcon className="-me-1 opacity-60" aria-hidden />
                    </Button>
                  }
                />
                <DropdownMenuContent align="end" className="min-w-32">
                  {Object.entries(VIEW_TYPE).map(([key, value]) => (
                    <DropdownMenuItem key={key} onClick={() => setView(key as CalendarView)}>
                      {value}
                      <DropdownMenuShortcut>{key.charAt(0).toUpperCase()}</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                className="max-sm:hidden max-[479px]:aspect-square max-[479px]:p-0!"
                icon={<PlusIcon aria-hidden />}
                onClick={handleCreateClick}
              >
                <span className="max-sm:sr-only">Додати</span>
              </Button>
            </div>
          </div>

          <div className="flex w-full flex-1 flex-col">
            {view === "month" ? <MonthView currentDate={currentDate} events={events} /> : null}
            {view === "week" ? <WeekView currentDate={currentDate} events={events} /> : null}
            {view === "day" ? <DayView currentDate={currentDate} events={events} /> : null}
          </div>
        </CalendarDndProvider>
      </div>
    </CalendarActionsProvider>
  );
};
