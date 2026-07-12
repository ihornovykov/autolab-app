import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { VehiclesView } from "@/views/organization/vehicles-view";

export const Route = createFileRoute("/_auth/dashboard/organization/vehicles")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.vehicle.listVehicles.queryOptions({ input: defaultListInput(organizationId) }),
      ),
    );
  },
  component: VehiclesView,
});
