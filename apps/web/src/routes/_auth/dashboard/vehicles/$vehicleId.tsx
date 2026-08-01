import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  prefetchOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/prefetch";
import { VehicleDetailView } from "@/views/vehicle/vehicle-detail-view";

export const Route = createFileRoute("/_auth/dashboard/vehicles/$vehicleId")({
  loader: async ({ context, parentMatchPromise, params }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.vehicle.getVehicleById.queryOptions({
          input: { organizationId, vehicleId: params.vehicleId },
        }),
      );
      void context.queryClient.prefetchQuery(
        orpc.booking.listVehicleBookings.queryOptions({
          input: {
            organizationId,
            vehicleId: params.vehicleId,
            page: 1,
            pageSize: defaultListInput(organizationId).pageSize,
          },
        }),
      );
    });
  },
  component: VehicleDetailView,
});
