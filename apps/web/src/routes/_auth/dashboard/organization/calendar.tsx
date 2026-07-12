import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultCalendarBookingsInput,
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { CalendarView } from "@/views/organization/calendar-view";

export const Route = createFileRoute("/_auth/dashboard/organization/calendar")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.booking.listBookings.queryOptions({
          input: defaultCalendarBookingsInput(organizationId),
        }),
      ),
    );
  },
  component: CalendarView,
});
