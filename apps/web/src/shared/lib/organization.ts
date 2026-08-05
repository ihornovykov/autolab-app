type OrganizationSummary = { id: string };

export const resolveSelectedOrganizationId = (
  storedOrganizationId: string | null,
  organizations: OrganizationSummary[] | undefined,
  isOrganizationsLoaded: boolean,
): string | null => {
  if (!isOrganizationsLoaded) return null;

  if (storedOrganizationId && organizations?.some((org) => org.id === storedOrganizationId)) {
    return storedOrganizationId;
  }

  return organizations?.[0]?.id ?? null;
};
