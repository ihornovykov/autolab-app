import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultCalendarBookingsInput,
  prefetchOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/prefetch";
import { CalendarView } from "@/views/organization/calendar-view";

export const Route = createFileRoute("/_auth/dashboard/organization/calendar")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.booking.listBookings.queryOptions({
          input: defaultCalendarBookingsInput(organizationId),
        }),
      );
    });
  },
  component: CalendarView,
});
