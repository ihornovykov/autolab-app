import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  prefetchOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/prefetch";
import { VehiclesView } from "@/views/organization/vehicles-view";

export const Route = createFileRoute("/_auth/dashboard/organization/vehicles")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.vehicle.listVehicles.queryOptions({ input: defaultListInput(organizationId) }),
      );
    });
  },
  component: VehiclesView,
});
