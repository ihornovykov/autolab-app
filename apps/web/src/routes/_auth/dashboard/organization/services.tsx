import { createFileRoute } from "@tanstack/react-router";

import { SERVICES_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { prefetchOrganizationQuery, resolveLoaderSearch } from "@/shared/lib/prefetch";
import { ServicesView } from "@/views/organization/services-view";

export const Route = createFileRoute("/_auth/dashboard/organization/services")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.service.listServices.queryOptions({
          input: {
            organizationId,
            page: 1,
            pageSize: SERVICES_PAGE_SIZE,
          },
        }),
      );
    });
  },
  component: ServicesView,
});
