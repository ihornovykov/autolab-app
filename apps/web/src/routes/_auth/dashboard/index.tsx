import { createFileRoute } from "@tanstack/react-router";

import { getDefaultDashboardDateRange } from "@/features/dashboard/lib/utils";
import { toListBookingsDateRange } from "@/features/booking/lib/utils";
import { orpc } from "@/shared/api/orpc";
import {
  prefetchOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/prefetch";
import { DashboardView } from "@/views/dashboard/dashboard-view";

export const Route = createFileRoute("/_auth/dashboard/")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    const range = toListBookingsDateRange(getDefaultDashboardDateRange());

    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.booking.getOrganizationAnalytics.queryOptions({
          input: {
            organizationId,
            from: range.from!,
            to: range.to!,
          },
        }),
      );
    });
  },
  component: DashboardView,
});
