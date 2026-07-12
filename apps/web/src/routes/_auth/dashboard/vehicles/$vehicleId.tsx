import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { VehicleDetailView } from "@/views/vehicle/vehicle-detail-view";

export const Route = createFileRoute("/_auth/dashboard/vehicles/$vehicleId")({
  loader: async ({ context, parentMatchPromise, params }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, async (organizationId) => {
      await Promise.all([
        context.queryClient.ensureQueryData(
          orpc.vehicle.getVehicleById.queryOptions({
            input: { organizationId, vehicleId: params.vehicleId },
          }),
        ),
        context.queryClient.ensureQueryData(
          orpc.booking.listVehicleBookings.queryOptions({
            input: {
              organizationId,
              vehicleId: params.vehicleId,
              page: 1,
              pageSize: defaultListInput(organizationId).pageSize,
            },
          }),
        ),
      ]);
    });
  },
  component: VehicleDetailView,
});
