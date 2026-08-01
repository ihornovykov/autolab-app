import { useQuery } from "@tanstack/react-query";
import { useSearch } from "@tanstack/react-router";
import { useEffect } from "react";

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

export const useSyncOrganizationSelection = (
  organizations: Array<{ id: string }>,
  searchOrganizationId?: string,
) => {
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationStore();
  const firstOrganizationId = organizations[0]?.id ?? null;

  useEffect(() => {
    if (searchOrganizationId) {
      if (searchOrganizationId !== selectedOrganizationId) {
        setSelectedOrganizationId(searchOrganizationId);
      }
      return;
    }

    if (!selectedOrganizationId && firstOrganizationId) {
      setSelectedOrganizationId(firstOrganizationId);
    }
  }, [
    firstOrganizationId,
    searchOrganizationId,
    selectedOrganizationId,
    setSelectedOrganizationId,
  ]);

  return selectedOrganizationId ?? firstOrganizationId;
};
