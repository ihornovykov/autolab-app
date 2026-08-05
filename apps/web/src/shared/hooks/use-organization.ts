import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

import { orpc } from "@/shared/api/orpc";
import { resolveSelectedOrganizationId } from "@/shared/lib/organization";
import { useOrganizationStore } from "@/shared/stores/organization";

export const useSelectedOrganizationId = () => {
  const storedOrganizationId = useOrganizationStore((state) => state.selectedOrganizationId);
  const organizationsQuery = useQuery(orpc.organization.listMyOrganizations.queryOptions());
  const organizations = organizationsQuery.data;

  return resolveSelectedOrganizationId(
    storedOrganizationId,
    organizations,
    organizationsQuery.isSuccess,
  );
};

export const useOrganizationContext = () => {
  const storedOrganizationId = useOrganizationStore((state) => state.selectedOrganizationId);
  const organizationsQuery = useQuery(orpc.organization.listMyOrganizations.queryOptions());
  const organizations = organizationsQuery.data;
  const organizationId = resolveSelectedOrganizationId(
    storedOrganizationId,
    organizations,
    organizationsQuery.isSuccess,
  );

  return {
    organizationId,
    isOrganizationLoading: organizationsQuery.isLoading || !organizationsQuery.isSuccess,
  };
};

export const useSyncOrganizationSelection = (organizations: Array<{ id: string }>) => {
  const { selectedOrganizationId, setSelectedOrganizationId } = useOrganizationStore();

  useEffect(() => {
    const validatedOrganizationId = resolveSelectedOrganizationId(
      selectedOrganizationId,
      organizations,
      true,
    );

    if (validatedOrganizationId !== selectedOrganizationId) {
      setSelectedOrganizationId(validatedOrganizationId);
    }
  }, [organizations, selectedOrganizationId, setSelectedOrganizationId]);

  return resolveSelectedOrganizationId(selectedOrganizationId, organizations, true);
};
