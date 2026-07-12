import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import {
  defaultListInput,
  ensureOrganizationQuery,
  resolveLoaderSearch,
} from "@/shared/lib/route-prefetch";
import { ClientsView } from "@/views/organization/clients-view";

export const Route = createFileRoute("/_auth/dashboard/organization/clients")({
  loader: async ({ context, parentMatchPromise }) => {
    const search = await resolveLoaderSearch({ parentMatchPromise });
    return ensureOrganizationQuery(context.queryClient, search, (organizationId) =>
      context.queryClient.ensureQueryData(
        orpc.client.listClients.queryOptions({ input: defaultListInput(organizationId) }),
      ),
    );
  },
  component: ClientsView,
});
