import { createFileRoute } from "@tanstack/react-router";
import { createStandardSchemaV1 } from "nuqs";

import { calendarFilterParams } from "@/features/calendar/hooks/use-calendar-filters";
import { orpc } from "@/shared/api/orpc";
import {
  defaultCalendarBookingsInput,
  prefetchOrganizationQuery,
} from "@/shared/lib/prefetch";
import { CalendarView } from "@/views/organization/calendar-view";

export const Route = createFileRoute("/_app/dashboard/organization/calendar")({
  validateSearch: createStandardSchemaV1(calendarFilterParams, { partialOutput: true }),
  loader: ({ context }) => {
    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.booking.listBookings.queryOptions({
          input: defaultCalendarBookingsInput(organizationId),
        }),
      );
    });
  },
  component: CalendarView,
});
