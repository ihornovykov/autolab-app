import { createFileRoute } from "@tanstack/react-router";
import { createStandardSchemaV1 } from "nuqs";

import { orpc } from "@/shared/api/orpc";
import { tableFilterParams } from "@/shared/hooks/use-table-filters";
import {
  defaultListInput,
  prefetchOrganizationQuery,
} from "@/shared/lib/prefetch";
import { ClientsView } from "@/views/organization/clients-view";

export const Route = createFileRoute("/_app/dashboard/organization/clients")({
  validateSearch: createStandardSchemaV1(tableFilterParams, { partialOutput: true }),
  loader: ({ context }) => {
    prefetchOrganizationQuery(context.queryClient, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.client.listClients.queryOptions({ input: defaultListInput(organizationId) }),
      );
    });
  },
  component: ClientsView,
});
