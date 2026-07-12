import { createFileRoute } from "@tanstack/react-router";

import { BOOKINGS_PAGE_SIZE } from "@/features/booking/lib/constants";
import { orpc } from "@/shared/api/orpc";
import {
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { BookingsView } from "@/views/organization/bookings-view";

export const Route = createFileRoute("/_auth/dashboard/organization/bookings/")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.booking.listBookings.queryOptions({
          input: {
            organizationId,
            page: 1,
            pageSize: BOOKINGS_PAGE_SIZE,
            includeCancelled: false,
            includePast: false,
            sort: "upcoming",
          },
        }),
      ),
    );
  },
  component: BookingsView,
});
