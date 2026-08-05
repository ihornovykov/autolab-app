import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  prefetchOrganizationQuery,
} from "@/shared/lib/prefetch";
import { BookingDetailView } from "@/views/organization/booking-detail-view";

export const Route = createFileRoute("/_app/dashboard/organization/bookings/$bookingId")({
  loader: ({ context, params }) => {
    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
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
