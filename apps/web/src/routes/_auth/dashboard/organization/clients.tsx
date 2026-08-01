import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  prefetchOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { ClientsView } from "@/views/organization/clients-view";

export const Route = createFileRoute("/_auth/dashboard/organization/clients")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    prefetchOrganizationQuery(context.queryClient, search, (organizationId) => {
      void context.queryClient.prefetchQuery(
        orpc.client.listClients.queryOptions({ input: defaultListInput(organizationId) }),
      );
    });
  },
  component: ClientsView,
});
