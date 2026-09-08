import { parseAsArrayOf, parseAsStringLiteral, useQueryStates } from "nuqs";

import type { EmployeeRole } from "@/features/employee/lib/types";
import { useDebouncedValue } from "@/shared/hooks/use-debounce";
import { parseAsPage, parseAsSearchQuery, toSearchQueryParam } from "@/shared/lib/nuqs-parsers";

export const employeesFilterParams = {
  q: parseAsSearchQuery,
  page: parseAsPage,
  roles: parseAsArrayOf(
    parseAsStringLiteral(["OWNER", "MANAGER", "TECHNICIAN"] as const),
  ).withDefault([]),
} as const;

export const useEmployeesFilters = () => {
  const [filters, setFilters] = useQueryStates(employeesFilterParams);
  const debouncedSearch = useDebouncedValue(filters.q);

  return {
    search: filters.q,
    debouncedSearch,
    page: filters.page,
    roleFilter: filters.roles as EmployeeRole[],
    setSearch: (value: string) => setFilters({ q: toSearchQueryParam(value), page: 1 }),
    setPage: (page: number) => setFilters({ page }),
    setRoleFilter: (roles: EmployeeRole[]) =>
      setFilters({ roles: roles.length > 0 ? roles : null, page: 1 }),
  };
};
