import { createFileRoute } from "@tanstack/react-router";

import { getDefaultDashboardDateRange } from "@/features/dashboard/lib/date-range-presets";
import { toListBookingsDateRange } from "@/features/booking/lib/date-range-filter";
import { orpc } from "@/shared/api/orpc";
import {
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { DashboardView } from "@/views/dashboard/dashboard-view";

export const Route = createFileRoute("/_auth/dashboard/")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    const range = toListBookingsDateRange(getDefaultDashboardDateRange());

    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.booking.getOrganizationAnalytics.queryOptions({
          input: {
            organizationId,
            from: range.from!,
            to: range.to!,
          },
        }),
      ),
    );
  },
  component: DashboardView,
});
