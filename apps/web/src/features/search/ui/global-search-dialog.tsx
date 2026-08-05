import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { SearchIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { getSearchResultNavigation } from "@/features/search/lib/utils";
import { SearchResultItem } from "@/features/search/ui/search-result-item";
import { orpc } from "@/shared/api/orpc";
import { useDebouncedValue } from "@/shared/hooks/use-debounce";
import { useOrganizationStore } from "@/shared/stores/organization";
import { Loader } from "@/shared/ui/loader";
import { Dialog } from "@autolab/ui/components/sheet";
import { Input } from "@autolab/ui/components/input";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string | null;
};

export const GlobalSearchDialog = ({ open, onOpenChange, organizationId }: Props) => {
  const navigate = useNavigate();
  const setSelectedOrganizationId = useOrganizationStore(
    (state) => state.setSelectedOrganizationId,
  );
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 250);
  const trimmedQuery = debouncedQuery.trim();

  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const searchQuery = useQuery({
    ...orpc.search.globalSearch.queryOptions({
      input: {
        organizationId: organizationId ?? undefined,
        query: trimmedQuery,
      },
    }),
    enabled: open && trimmedQuery.length >= 2,
  });

  const results = searchQuery.data?.items ?? [];
  const isLoading = searchQuery.isFetching && trimmedQuery.length >= 2;
  const showEmpty = trimmedQuery.length >= 2 && !isLoading && results.length === 0;

  const handleSelect = (item: (typeof results)[number]) => {
    const target = getSearchResultNavigation(item);
    onOpenChange(false);

    if ("selectOrganizationId" in target) {
      setSelectedOrganizationId(target.selectOrganizationId);
      navigate({ to: target.to });
      return;
    }

    if ("params" in target) {
      navigate({ to: target.to, params: target.params });
      return;
    }

    navigate({ to: target.to });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} className="max-w-2xl" title="Пошук">
      <div className="space-y-4">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук у всьому..."
            className="h-11 pl-9"
          />
        </div>

        <div className="min-h-48">
          {trimmedQuery.length < 2 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Введіть щонайменше 2 символи
            </p>
          ) : isLoading ? (
            <div className="flex justify-center py-10">
              <Loader />
            </div>
          ) : showEmpty ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Нічого не знайдено</p>
          ) : (
            <div className="max-h-[min(60vh,28rem)] space-y-2 overflow-y-auto pr-1">
              {results.map((item) => (
                <SearchResultItem
                  key={`${item.type}:${item.id}:${item.groupKey}:${item.relation}`}
                  item={item}
                  onClick={() => handleSelect(item)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
};
