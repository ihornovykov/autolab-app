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

export const defaultListInput = (organizationId: string) => ({
  organizationId,
  page: 1,
  pageSize: DEFAULT_PAGE_SIZE,
});

export const defaultCalendarBookingsInput = (organizationId: string) =>
  createCalendarBookingsInput(organizationId, getCalendarFetchRange("week", new Date()));

export const ensureOrganizations = (queryClient: QueryClient) =>
  queryClient.ensureQueryData(orpc.organization.listMyOrganizations.queryOptions());

export const resolveOrganizationId = async (
  queryClient: QueryClient,
  search: DashboardSearch,
) => {
  const organizations = await ensureOrganizations(queryClient);
  return search.organizationId ?? organizations[0]?.id;
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

export const ensureOrganizationQuery = async (
  queryClient: QueryClient,
  search: DashboardSearch,
  prefetch: (organizationId: string) => Promise<unknown>,
) => {
  const organizationId = await resolveOrganizationId(queryClient, search);
  if (!organizationId) return null;
  await prefetch(organizationId);
  return organizationId;
};
