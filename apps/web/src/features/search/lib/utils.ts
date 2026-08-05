import type { SearchResultType } from "@/features/search/lib/types";

type SearchResult = {
  id: string;
  type: SearchResultType;
};

export type SearchResultNavigation =
  | {
      to: "/dashboard";
      selectOrganizationId: string;
    }
  | {
      to:
        | "/dashboard/organization/employees"
        | "/dashboard/organization/clients"
        | "/dashboard/organization/services";
    }
  | {
      to: "/dashboard/vehicles/$vehicleId";
      params: { vehicleId: string };
    }
  | {
      to: "/dashboard/organization/bookings/$bookingId";
      params: { bookingId: string };
    };

export const getSearchResultNavigation = (item: SearchResult): SearchResultNavigation => {
  if (item.type === "organization") {
    return { to: "/dashboard", selectOrganizationId: item.id };
  }

  if (item.type === "employee") {
    return { to: "/dashboard/organization/employees" };
  }

  if (item.type === "client") {
    return { to: "/dashboard/organization/clients" };
  }

  if (item.type === "service") {
    return { to: "/dashboard/organization/services" };
  }

  if (item.type === "vehicle") {
    return {
      to: "/dashboard/vehicles/$vehicleId",
      params: { vehicleId: item.id },
    };
  }

  return {
    to: "/dashboard/organization/bookings/$bookingId",
    params: { bookingId: item.id },
  };
};
