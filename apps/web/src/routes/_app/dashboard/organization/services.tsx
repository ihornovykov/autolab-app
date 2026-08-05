import { createFileRoute } from "@tanstack/react-router";
import { createStandardSchemaV1 } from "nuqs";

import { SERVICES_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { tableFilterParams } from "@/shared/hooks/use-table-filters";
import { prefetchOrganizationQuery } from "@/shared/lib/prefetch";
import { ServicesView } from "@/views/organization/services-view";

export const Route = createFileRoute("/_app/dashboard/organization/services")({
  validateSearch: createStandardSchemaV1(tableFilterParams, { partialOutput: true }),
  loader: ({ context }) => {
    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
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
