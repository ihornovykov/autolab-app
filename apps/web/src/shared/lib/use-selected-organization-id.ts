import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import { useOrganizationStore } from "@/shared/stores/organization";

export const useSelectedOrganizationId = () => {
  const search = useSearch({ strict: false });
  const storedOrganizationId = useOrganizationStore((state) => state.selectedOrganizationId);
  const organizationsQuery = useQuery(orpc.organization.listMyOrganizations.queryOptions());
  const organizations = organizationsQuery.data ?? [];

  const searchOrganizationId =
    "organizationId" in search && typeof search.organizationId === "string"
      ? search.organizationId
      : undefined;

  return searchOrganizationId ?? storedOrganizationId ?? organizations[0]?.id ?? null;
};
