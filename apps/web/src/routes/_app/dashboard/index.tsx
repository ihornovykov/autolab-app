import { createFileRoute } from "@tanstack/react-router";
import { createStandardSchemaV1 } from "nuqs";

import { dashboardFilterParams } from "@/features/dashboard/hooks/use-dashboard-filters";
import { getDefaultDashboardDateRange } from "@/features/dashboard/lib/utils";
import { toListBookingsDateRange } from "@/features/booking/lib/utils";
import { orpc } from "@/shared/api/orpc";
import { prefetchOrganizationQuery } from "@/shared/lib/prefetch";
import { DashboardView } from "@/views/dashboard/dashboard-view";

export const Route = createFileRoute("/_app/dashboard/")({
  validateSearch: createStandardSchemaV1(dashboardFilterParams, { partialOutput: true }),
  loader: ({ context }) => {
    const range = toListBookingsDateRange(getDefaultDashboardDateRange());

    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
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
