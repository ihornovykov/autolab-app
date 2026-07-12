import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { DashboardView } from "@/views/dashboard/dashboard-view";

export const Route = createFileRoute("/_auth/dashboard/")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.booking.getDashboardStats.queryOptions({ input: { organizationId } }),
      ),
    );
  },
  component: DashboardView,
});
