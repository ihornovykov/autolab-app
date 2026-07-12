import { createFileRoute } from "@tanstack/react-router";

import { SERVICES_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { ensureOrganizationQuery, resolveLoaderSearch } from "@/shared/lib/route-prefetch";
import { ServicesView } from "@/views/organization/services-view";

export const Route = createFileRoute("/_auth/dashboard/organization/services")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.service.listServices.queryOptions({
          input: {
            organizationId,
            page: 1,
            pageSize: SERVICES_PAGE_SIZE,
          },
        }),
      ),
    );
  },
  component: ServicesView,
});
