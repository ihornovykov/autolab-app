import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  resolveLoaderSearch,
  resolveOrganizationId,
} from "@/shared/lib/route-prefetch";
import { BookingDetailView } from "@/views/organization/booking-detail-view";

export const Route = createFileRoute("/_auth/dashboard/organization/bookings/$bookingId")({
  loader: async ({ context, parentMatchPromise, params }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    const organizationId = await resolveOrganizationId(context.queryClient, search);
    if (!organizationId) return null;

    const booking = await context.queryClient.ensureQueryData(
      orpc.booking.getBookingById.queryOptions({
        input: { organizationId, bookingId: params.bookingId },
      }),
    );

    if (booking?.vehicleId) {
      await context.queryClient.ensureQueryData(
        orpc.vehicle.getVehicleById.queryOptions({
          input: { organizationId, vehicleId: booking.vehicleId },
        }),
      );
    }

    return organizationId;
  },
  component: BookingDetailView,
});
