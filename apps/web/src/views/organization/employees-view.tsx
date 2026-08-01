import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";

import { employeeRoleOptions } from "@/features/employee/lib/constants";
import type { EmployeeRole } from "@/features/employee/lib/types";
import { InviteEmployeeDialog } from "@/features/employee/ui/invite-employee-dialog";
import { EditEmployeeSheet } from "@/features/employee/ui/edit-employee-sheet";
import { orpc } from "@/shared/api/orpc";
import { formatDate } from "@/shared/lib/date";
import { isQueryContentLoading } from "@/shared/lib/query";
import { DEFAULT_PAGE_SIZE } from "@/shared/lib/pagination";
import { useDebouncedValue } from "@/shared/hooks/use-debounce";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { DataTable } from "@/shared/ui/data-table";
import { DataTableFilterBox } from "@/shared/ui/data-table-filter-box";
import { DataTableLayout } from "@/shared/ui/data-table-layout";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { DataTableSearch } from "@/shared/ui/data-table-search";
import { Heading, PageContainer } from "@/shared/ui/page-container";
import { RoleBadge } from "@/shared/ui/role-badge";
import { StatusLight } from "@/shared/ui/status-light";
import { Avatar } from "@autolab/ui/components/avatar";
import { Button } from "@autolab/ui/components/button";

type EmployeeRow = {
  id: string;
  role: EmployeeRole;
  isActive: boolean;
  startDate: Date;
  user: {
    name: string;
    email: string;
    image?: string | null;
    profile?: { firstName?: string | null; lastName?: string | null } | null;
  };
};

export const EmployeesView = () => {
  const organizationId = useSelectedOrganizationId();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<EmployeeRole[]>([]);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, roleFilter]);

  const employeesQuery = useQuery({
    ...orpc.employee.listEmployees.queryOptions({
      input: {
        organizationId: organizationId!,
        page,
        pageSize: DEFAULT_PAGE_SIZE,
        search: debouncedSearch || undefined,
        roles: roleFilter.length > 0 ? roleFilter : undefined,
      },
    }),
    enabled: !!organizationId,
  });

  const columns: ColumnDef<EmployeeRow>[] = [
    {
      header: "Працівник",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar
            src={row.original.user.image}
            fallback={row.original.user.name}
            className="size-9"
          />
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.user.name}</p>
            <p className="truncate text-sm text-muted-foreground">{row.original.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: "Роль",
      cell: ({ row }) => <RoleBadge role={row.original.role} />,
    },
    {
      header: "Статус",
      cell: ({ row }) => (
        <StatusLight
          status={row.original.isActive ? "ACTIVE" : "INACTIVE"}
          className={
            row.original.isActive ? "text-sm text-status-success" : "text-sm text-muted-foreground"
          }
        />
      ),
    },
    {
      header: "Дата найму",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(row.original.startDate, "iso")}
        </span>
      ),
    },
  ];

  if (!organizationId) return null;

  const rows = (employeesQuery.data?.items ?? []) as EmployeeRow[];
  const isLoading = isQueryContentLoading(employeesQuery, {
    isPending: search !== debouncedSearch,
  });

  return (
    <PageContainer scrollable={false} className="flex h-full min-h-0 flex-col">
      <Heading title="Працівники" />

      <DataTableLayout
        toolbarLeft={
          <div className="flex items-center gap-2">
            <DataTableSearch value={search} onChange={setSearch} />
            <DataTableFilterBox
              title="Роль"
              options={employeeRoleOptions}
              value={roleFilter}
              onChange={(value) => setRoleFilter(value as EmployeeRole[])}
            />
          </div>
        }
        toolbarRight={
          <Button
            icon={<PlusIcon />}
            onClick={() => dialogs.open(<InviteEmployeeDialog organizationId={organizationId} />)}
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
          onRowClick={(row) =>
            sheets.open(<EditEmployeeSheet employee={row} organizationId={organizationId} />)
          }
          emptyMessage="Нема результатів"
        />
        <DataTablePagination
          page={page}
          totalPages={employeesQuery.data?.totalPages ?? 0}
          total={employeesQuery.data?.total ?? 0}
          pageSize={DEFAULT_PAGE_SIZE}
          onPageChange={setPage}
        />
      </DataTableLayout>
    </PageContainer>
  );
};
