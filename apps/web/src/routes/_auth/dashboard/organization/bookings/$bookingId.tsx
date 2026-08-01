import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  prefetchOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/prefetch";
import { BookingDetailView } from "@/views/organization/booking-detail-view";

export const Route = createFileRoute("/_auth/dashboard/organization/bookings/$bookingId")({
  loader: async ({ context, parentMatchPromise, params }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient
        .fetchQuery(
          orpc.booking.getBookingById.queryOptions({
            input: { organizationId, bookingId: params.bookingId },
          }),
        )
        .then((booking) => {
          if (!booking?.vehicleId) return;
          void context.queryClient.prefetchQuery(
            orpc.vehicle.getVehicleById.queryOptions({
              input: { organizationId, vehicleId: booking.vehicleId },
            }),
          );
        });
    });
  },
  component: BookingDetailView,
});
