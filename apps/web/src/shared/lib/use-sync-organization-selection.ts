import { useEffect } from "react";

import { useOrganizationStore } from "@/shared/stores/organization";

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
