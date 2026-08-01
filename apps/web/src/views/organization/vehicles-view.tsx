import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { ColumnDef } from "@tanstack/react-table";
import { PencilIcon, PlusIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";

import { CreateOrganizationVehicleDialog } from "@/features/vehicle/ui/create-organization-vehicle-dialog";
import { DeleteOrganizationVehicleDialog } from "@/features/vehicle/ui/delete-organization-vehicle-dialog";
import { EditOrganizationVehicleSheet } from "@/features/vehicle/ui/edit-organization-vehicle-sheet";
import {
  VehicleTableIdentity,
  VehicleTableLicensePlate,
} from "@/features/vehicle/ui/vehicle-table-cells";
import { orpc } from "@/shared/api/orpc";
import { getClientName } from "@/shared/lib/client";
import { isQueryContentLoading } from "@/shared/lib/query";
import { DEFAULT_PAGE_SIZE } from "@/shared/lib/pagination";
import { useDebouncedValue } from "@/shared/hooks/use-debounce";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { DataTable } from "@/shared/ui/data-table";
import { DataTableLayout } from "@/shared/ui/data-table-layout";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { DataTableSearch } from "@/shared/ui/data-table-search";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { Button } from "@autolab/ui/components/button";

type VehicleRow = {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
  bodyStyle?: string | null;
  engine?: string | null;
  engineVolume?: number | null;
  client?: {
    id: string;
    firstName: string;
    lastName?: string | null;
    middleName?: string | null;
  } | null;
  createdAt: Date;
};

export const VehiclesView = () => {
  const organizationId = useSelectedOrganizationId();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const vehiclesQuery = useQuery({
    ...orpc.vehicle.listVehicles.queryOptions({
      input: {
        organizationId: organizationId!,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
      },
    }),
    enabled: !!organizationId,
  });

  const openVehicle = (vehicleId: string) => {
    navigate({
      to: "/dashboard/vehicles/$vehicleId",
      params: { vehicleId },
      search: { organizationId: organizationId! },
    });
  };

  const openEditSheet = (vehicle: VehicleRow) => {
    sheets.open(
      <EditOrganizationVehicleSheet vehicle={vehicle} organizationId={organizationId!} />,
    );
  };

  const columns: ColumnDef<VehicleRow>[] = [
    {
      header: "Автомобіль",
      cell: ({ row }) => <VehicleTableIdentity vehicle={row.original} />,
    },
    {
      header: "Клієнт",
      cell: ({ row }) => (
        <div className="min-w-0 py-0.5">
          {row.original.client ? (
            <>
              <p className="truncate text-sm font-medium">{getClientName(row.original.client)}</p>
              {row.original.bodyStyle ? (
                <p className="truncate text-xs text-muted-foreground">{row.original.bodyStyle}</p>
              ) : null}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      ),
    },
    {
      header: "Державний номер",
      cell: ({ row }) => <VehicleTableLicensePlate licensePlate={row.original.licensePlate} />,
    },
    {
      id: "actions",
      header: "Дії",
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Редагувати автомобіль"
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
            aria-label="Видалити автомобіль"
            onClick={(event) => {
              event.stopPropagation();
              dialogs.open(
                <DeleteOrganizationVehicleDialog
                  organizationId={organizationId!}
                  vehicleId={row.original.id}
                  make={row.original.make}
                  model={row.original.model}
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

  const rows = (vehiclesQuery.data?.items ?? []) as VehicleRow[];
  const isLoading = isQueryContentLoading(vehiclesQuery, {
    isPending: search !== debouncedSearch,
  });

  return (
    <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
      <Heading title="Авто" />
      <DataTableLayout
        toolbarLeft={
          <DataTableSearch value={search} onChange={setSearch} placeholder="Пошук авто" />
        }
        toolbarRight={
          <Button
            icon={<PlusIcon />}
            onClick={() =>
              dialogs.open(<CreateOrganizationVehicleDialog organizationId={organizationId} />)
            }
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
          onRowClick={(row) => openVehicle(row.id)}
          emptyMessage="Нема результатів"
        />
        <DataTablePagination
          page={page}
          totalPages={vehiclesQuery.data?.totalPages ?? 0}
          total={vehiclesQuery.data?.total ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </DataTableLayout>
    </PageContainer>
  );
};
