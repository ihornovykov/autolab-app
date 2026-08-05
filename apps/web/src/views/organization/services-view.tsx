import { useQuery } from "@tanstack/react-query";
import { ClipboardListIcon, PlusIcon } from "lucide-react";

import { CreateServiceDialog } from "@/features/service/ui/create-service-dialog";
import { EditServiceSheet } from "@/features/service/ui/edit-service-sheet";
import { ServiceCard, ServiceCardGridSkeleton } from "@/features/service/ui/service-card";
import { SERVICES_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { isQueryContentLoading } from "@/shared/lib/query";
import { useTableFilters } from "@/shared/hooks/use-table-filters";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { DataTableLayout } from "@/shared/ui/data-table-layout";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { DataTableSearch } from "@/shared/ui/data-table-search";
import { EmptyState } from "@/shared/ui/empty-state";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Button } from "@autolab/ui/components/button";

type ServiceRow = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  price: string;
  duration: number;
};

export const ServicesView = () => {
  const organizationId = useSelectedOrganizationId();
  const { search, debouncedSearch, page, setSearch, setPage } = useTableFilters();

  const servicesQuery = useQuery({
    ...orpc.service.listServices.queryOptions({
      input: {
        organizationId: organizationId!,
        page,
        pageSize: SERVICES_PAGE_SIZE,
        search: debouncedSearch || undefined,
      },
    }),
    enabled: !!organizationId,
  });

  const openEditSheet = (service: ServiceRow) => {
    sheets.open(<EditServiceSheet service={service} organizationId={organizationId!} />);
  };

  if (!organizationId) return null;

  const filtered = (servicesQuery.data?.items ?? []) as ServiceRow[];
  const total = servicesQuery.data?.total ?? 0;
  const hasFilteredResults = filtered.length > 0;
  const isLoading = isQueryContentLoading(servicesQuery, {
    isPending: search !== debouncedSearch,
  });

  return (
    <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
      <Heading title="Послуги" />

      <DataTableLayout
        toolbarLeft={
          <DataTableSearch value={search} onChange={setSearch} placeholder="Пошук послуг" />
        }
        toolbarRight={
          <Button
            icon={<PlusIcon />}
            onClick={() => dialogs.open(<CreateServiceDialog organizationId={organizationId} />)}
          >
            Додати послугу
          </Button>
        }
      >
        <div className="h-full min-h-0 overflow-y-auto">
          {isLoading ? (
            <ServiceCardGridSkeleton count={SERVICES_PAGE_SIZE} />
          ) : hasFilteredResults ? (
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 xl:grid-cols-3">
              {filtered.map((service) => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onClick={() => openEditSheet(service)}
                />
              ))}
            </div>
          ) : (
            <div className="flex min-h-80 items-center justify-center">
              <EmptyState
                icon={ClipboardListIcon}
                title={total > 0 ? "Нема результатів" : "Немає послуг"}
                description={
                  total > 0
                    ? "Спробуйте змінити пошук"
                    : "Додайте першу послугу для вашої організації"
                }
                actionLabel={total > 0 ? undefined : "Додати послугу"}
                onAction={
                  total > 0
                    ? undefined
                    : () => dialogs.open(<CreateServiceDialog organizationId={organizationId} />)
                }
              />
            </div>
          )}
        </div>
        <DataTablePagination
          page={page}
          totalPages={servicesQuery.data?.totalPages ?? 0}
          total={total}
          pageSize={SERVICES_PAGE_SIZE}
          onPageChange={setPage}
        />
      </DataTableLayout>
    </PageContainer>
  );
};
