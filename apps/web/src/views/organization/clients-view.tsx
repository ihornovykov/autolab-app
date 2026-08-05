import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";

import { CreateClientDialog } from "@/features/client/ui/create-client-dialog";
import { ClientDetailSheet } from "@/features/client/ui/client-detail-sheet";
import { DeleteClientDialog } from "@/features/client/ui/delete-client-dialog";
import { EditClientSheet } from "@/features/client/ui/edit-client-sheet";
import { orpc } from "@/shared/api/orpc";
import { formatDate } from "@/shared/lib/date";
import { getClientDisplayName } from "@/shared/lib/client";
import { isQueryContentLoading } from "@/shared/lib/query";
import { DEFAULT_PAGE_SIZE } from "@/shared/lib/pagination";
import { useTableFilters } from "@/shared/hooks/use-table-filters";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { DataTable } from "@/shared/ui/data-table";
import { DataTableLayout } from "@/shared/ui/data-table-layout";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { DataTableSearch } from "@/shared/ui/data-table-search";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Button } from "@autolab/ui/components/button";

type ClientRow = {
  id: string;
  firstName: string;
  lastName?: string | null;
  middleName?: string | null;
  phone?: string | null;
  email?: string | null;
  vehicleCount: number;
  createdAt: Date;
};

export const ClientsView = () => {
  const organizationId = useSelectedOrganizationId();
  const { search, debouncedSearch, page, setSearch, setPage } = useTableFilters();

  const clientsQuery = useQuery({
    ...orpc.client.listClients.queryOptions({
      input: {
        organizationId: organizationId!,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      },
    }),
    enabled: !!organizationId,
  });

  const openDetailSheet = (client: ClientRow) => {
    sheets.open(<ClientDetailSheet client={client} organizationId={organizationId!} />);
  };

  const openEditSheet = (client: ClientRow) => {
    sheets.open(<EditClientSheet client={client} organizationId={organizationId!} />);
  };

  const columns: ColumnDef<ClientRow>[] = [
    {
      header: "Клієнт",
      cell: ({ row }) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{getClientDisplayName(row.original)}</p>
          {row.original.email ? (
            <p className="truncate text-sm text-muted-foreground">{row.original.email}</p>
          ) : null}
        </div>
      ),
    },
    {
      header: "Телефон",
      cell: ({ row }) =>
        row.original.phone ? (
          <span className="font-mono text-sm tabular-nums">{row.original.phone}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      header: "Авто",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.vehicleCount}</span>
      ),
    },
    {
      header: "Доданий",
      cell: ({ row }) => (
        <span className="font-mono text-sm text-muted-foreground tabular-nums">
          {formatDate(row.original.createdAt, "iso")}
        </span>
      ),
    },
    {
      header: "Дії",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Редагувати клієнта"
            onClick={(event) => {
              event.stopPropagation();
              openEditSheet(row.original);
            }}
          >
            <PencilIcon className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Видалити клієнта"
            onClick={(event) => {
              event.stopPropagation();
              dialogs.open(
                <DeleteClientDialog
                  organizationId={organizationId!}
                  clientId={row.original.id}
                  firstName={row.original.firstName}
                  lastName={row.original.lastName}
                />,
              );
            }}
          >
            <Trash2Icon className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  if (!organizationId) return null;

  const rows = (clientsQuery.data?.items ?? []) as ClientRow[];
  const isLoading = isQueryContentLoading(clientsQuery, {
    isPending: search !== debouncedSearch,
  });

  return (
    <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
      <Heading title="Клієнти" />
      <DataTableLayout
        toolbarLeft={<DataTableSearch value={search} onChange={setSearch} />}
        toolbarRight={
          <Button
            icon={<PlusIcon />}
            onClick={() => dialogs.open(<CreateClientDialog organizationId={organizationId} />)}
          >
            Додати
          </Button>
        }
      >
        <DataTable
          className="h-full"
          columns={columns}
          data={rows}
          isLoading={isLoading}
          onRowClick={openDetailSheet}
          emptyMessage="Нема результатів"
        />
        <DataTablePagination
          page={page}
          totalPages={clientsQuery.data?.totalPages ?? 0}
          total={clientsQuery.data?.total ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </DataTableLayout>
    </PageContainer>
  );
};
