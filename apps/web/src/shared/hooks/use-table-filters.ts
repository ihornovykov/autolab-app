import { useQueryStates } from "nuqs";

import { useDebouncedValue } from "@/shared/hooks/use-debounce";
import { parseAsPage, parseAsSearchQuery, toSearchQueryParam } from "@/shared/lib/nuqs-parsers";

export const tableFilterParams = {
  q: parseAsSearchQuery,
  page: parseAsPage,
} as const;

export const useTableFilters = () => {
  const [filters, setFilters] = useQueryStates(tableFilterParams);
  const debouncedSearch = useDebouncedValue(filters.q);

  return {
    search: filters.q,
    debouncedSearch,
    page: filters.page,
    setSearch: (value: string) => setFilters({ q: toSearchQueryParam(value), page: 1 }),
    setPage: (page: number) => setFilters({ page }),
  };
};
