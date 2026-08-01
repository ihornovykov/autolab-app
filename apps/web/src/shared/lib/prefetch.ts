import type { QueryClient } from "@tanstack/react-query";

import { orpc } from "@/shared/api/orpc";
import { createCalendarBookingsInput, getCalendarFetchRange } from "@/features/calendar/lib/calendar-range";
import { DEFAULT_PAGE_SIZE } from "@/shared/lib/pagination";

type DashboardSearch = {
  organizationId?: string;
};

type LoaderSearchContext = {
  search?: unknown;
  parentMatchPromise?: Promise<{ search: unknown } | undefined>;
};

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

export const resolveOrganizationId = (
  queryClient: QueryClient,
  search: DashboardSearch,
): string | undefined => {
  const organizations = getCachedOrganizations(queryClient);
  return search.organizationId ?? organizations?.[0]?.id;
};

export const resolveLoaderSearch = async ({
  search,
  parentMatchPromise,
}: LoaderSearchContext): Promise<DashboardSearch> => {
  if (search && typeof search === "object" && "organizationId" in search) {
    return search as DashboardSearch;
  }

  const parent = await parentMatchPromise;
  return (parent?.search ?? {}) as DashboardSearch;
};

export const prefetchOrganizationQuery = (
  queryClient: QueryClient,
  search: DashboardSearch,
  prefetch: (organizationId: string) => void,
) => {
  const organizationId = resolveOrganizationId(queryClient, search);
  if (organizationId) {
    prefetch(organizationId);
    return;
  }

  void queryClient.prefetchQuery(organizationListQueryOptions()).then(() => {
    const resolvedOrganizationId = resolveOrganizationId(queryClient, search);
    if (resolvedOrganizationId) prefetch(resolvedOrganizationId);
  });
};
