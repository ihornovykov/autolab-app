import { createFileRoute } from "@tanstack/react-router";
import { createStandardSchemaV1 } from "nuqs";

import { bookingsFilterParams } from "@/features/booking/hooks/use-bookings-filters";
import { BOOKINGS_PAGE_SIZE } from "@/features/booking/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { prefetchOrganizationQuery } from "@/shared/lib/prefetch";
import { BookingsView } from "@/views/organization/bookings-view";

export const Route = createFileRoute("/_app/dashboard/organization/bookings/")({
  validateSearch: createStandardSchemaV1(bookingsFilterParams, { partialOutput: true }),
  loader: ({ context }) => {
    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
      void context.queryClient.prefetchQuery(
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
      );
    });
  },
  component: BookingsView,
});
