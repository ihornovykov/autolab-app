import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@autolab/ui/components/table";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Building2Icon } from "lucide-react";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { useTableState } from "@/shared/hooks/use-table-state";
import { NameCell, PAGE_SIZE, TableFrame } from "@/shared/ui/admin-table";
import { PageHeader } from "@/shared/ui/admin-shell";
import { CreateOrganizationButton, DeleteEntityButton } from "@/views/admin/organization-forms";

export const OrganizationsView = () => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const remove = useMutation(
    orpc.admin.organization.deleteOrganization.mutationOptions({
      onSuccess: () => {
        toast.success("Майстерню видалено");
        void queryClient.invalidateQueries({ queryKey: orpc.admin.organization.key() });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const query = useQuery(
    orpc.admin.organization.listOrganizations.queryOptions({
      input: {
        search: table.search || undefined,
        page: table.page,
        pageSize: PAGE_SIZE,
        sort: "createdAt",
        direction: "desc",
      },
    }),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Організації" description="Майстерні на платформі. Відкрийте майстерню, щоб бачити її людей і записи." />
      <TableFrame
        search={table.search}
        onSearch={table.onSearch}
        searchPlaceholder="Назва, slug, email або телефон"
        page={table.page}
        totalPages={query.data?.totalPages ?? 0}
        total={query.data?.total ?? 0}
        onPageChange={table.setPage}
        isLoading={query.isLoading}
        toolbar={<CreateOrganizationButton />}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Адреса</TableHead>
              <TableHead>Контакт</TableHead>
              <TableHead>Працівники</TableHead>
              <TableHead>Записи</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  Організацій не знайдено
                </TableCell>
              </TableRow>
            ) : null}
            {query.data?.items.map((organization) => (
              <TableRow key={organization.id}>
                <TableCell>
                  <NameCell icon={Building2Icon}>
                    <Link
                      to="/organizations/$organizationId"
                      params={{ organizationId: organization.id }}
                      className="font-medium hover:underline"
                    >
                      {organization.name}
                    </Link>
                    <div className="text-xs text-muted-foreground">{organization.slug}</div>
                  </NameCell>
                </TableCell>
                <TableCell className="text-muted-foreground">{organization.address ?? "—"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {organization.phone ?? organization.email ?? "—"}
                </TableCell>
                <TableCell>{organization.employeeCount}</TableCell>
                <TableCell>{organization.bookingCount}</TableCell>
                <TableCell className="text-right">
                  <DeleteEntityButton
                    title="Видалити майстерню"
                    onDelete={() => remove.mutateAsync({ id: organization.id })}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableFrame>
    </div>
  );
};
