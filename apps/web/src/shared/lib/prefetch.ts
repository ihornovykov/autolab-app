import type { QueryClient } from "@tanstack/react-query";

import { createCalendarBookingsInput, getCalendarFetchRange } from "@/features/calendar/lib/utils";
import { orpc } from "@/shared/api/orpc";
import { resolveSelectedOrganizationId } from "@/shared/lib/organization";
import { DEFAULT_PAGE_SIZE } from "@/shared/lib/pagination";
import { useOrganizationStore } from "@/shared/stores/organization";

type OrganizationSummary = { id: string };

const organizationListQueryOptions = () => orpc.organization.listMyOrganizations.queryOptions();

const getCachedOrganizations = (queryClient: QueryClient): OrganizationSummary[] | undefined =>
  queryClient.getQueryData(organizationListQueryOptions().queryKey) as
    | OrganizationSummary[]
    | undefined;

export const defaultListInput = (organizationId: string) => ({
  organizationId,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
});

export const defaultCalendarBookingsInput = (organizationId: string) =>
  createCalendarBookingsInput(organizationId, getCalendarFetchRange("week", new Date()));

export const prefetchOrganizations = (queryClient: QueryClient) => {
  void queryClient.prefetchQuery(organizationListQueryOptions());
};

export const resolveOrganizationId = (queryClient: QueryClient): string | undefined => {
  const organizations = getCachedOrganizations(queryClient);
  if (!organizations?.length) return undefined;

  const storedOrganizationId = useOrganizationStore.getState().selectedOrganizationId;
  return (
    resolveSelectedOrganizationId(storedOrganizationId, organizations, true) ?? undefined
  );
};

export const prefetchOrganizationQuery = (
  queryClient: QueryClient,
  prefetch: (organizationId: string) => void,
) => {
  const organizationId = resolveOrganizationId(queryClient);
  if (organizationId) {
    prefetch(organizationId);
    return;
  }

  void queryClient.prefetchQuery(organizationListQueryOptions()).then(() => {
    const resolvedOrganizationId = resolveOrganizationId(queryClient);
    if (resolvedOrganizationId) prefetch(resolvedOrganizationId);
  });
};
