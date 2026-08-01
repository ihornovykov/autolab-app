import { uk } from "date-fns/locale";
import { useMemo } from "react";

import { mapBookingsToCalendarEvents } from "@/features/calendar/lib/utils";
import { isQueryContentLoading } from "@/shared/lib/query";
import { useCalendarBookings } from "@/features/calendar/hooks/use-calendar-bookings";
import { useCalendarStore } from "@/features/calendar/lib/stores";
import { EventCalendar } from "@/features/calendar/ui/event-calendar";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Calendar } from "@autolab/ui/components/calendar";

export const CalendarView = () => {
  const organizationId = useSelectedOrganizationId();
  const currentDate = useCalendarStore((state) => state.currentDate);
  const setCurrentDate = useCalendarStore((state) => state.setCurrentDate);
  const bookingsQuery = useCalendarBookings(organizationId);

  const events = useMemo(
    () => mapBookingsToCalendarEvents(bookingsQuery.bookings),
    [bookingsQuery.bookings],
  );
  const isLoading = isQueryContentLoading(bookingsQuery);

  if (!organizationId) return null;

  return (
    <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col gap-4">
      <Heading title="Календар" />
      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <Calendar
          locale={uk}
          mode="single"
          selected={currentDate}
          onSelect={(value) => value && setCurrentDate(value)}
          captionLayout="dropdown"
          className="hidden h-fit w-fit rounded-lg border shadow-sm lg:block"
        />
        <div className="min-h-0 w-full flex-1">
          <EventCalendar
            events={events}
            bookings={bookingsQuery.bookings}
            organizationId={organizationId}
            isLoading={isLoading}
          />
        </div>
      </div>
    </PageContainer>
  );
};
