import type { SearchResultType } from "@/features/search/lib/search-result-meta";

type SearchResult = {
  id: string;
  type: SearchResultType;
};

export const getSearchResultNavigation = (
  item: SearchResult,
  organizationId: string | null,
) => {
  if (item.type === "organization") {
    return {
      to: "/dashboard" as const,
      search: { organizationId: item.id },
    };
  }

  const orgSearch = { organizationId: organizationId ?? undefined };

  if (item.type === "employee") {
    return { to: "/dashboard/organization/employees" as const, search: orgSearch };
  }

  if (item.type === "client") {
    return { to: "/dashboard/organization/clients" as const, search: orgSearch };
  }

  if (item.type === "service") {
    return { to: "/dashboard/organization/services" as const, search: orgSearch };
  }

  if (item.type === "vehicle") {
    return {
      to: "/dashboard/vehicles/$vehicleId" as const,
      params: { vehicleId: item.id },
      search: orgSearch,
    };
  }

  return {
    to: "/dashboard/organization/bookings/$bookingId" as const,
    params: { bookingId: item.id },
    search: orgSearch,
  };
};
