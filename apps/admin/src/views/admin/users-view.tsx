import { Badge } from "@autolab/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@autolab/ui/components/table";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ShieldIcon, UserRoundIcon } from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import { useTableState } from "@/shared/hooks/use-table-state";
import { NameCell, PAGE_SIZE, TableFrame } from "@/shared/ui/admin-table";
import { PageHeader } from "@/shared/ui/admin-shell";

export const UsersView = () => {
  const table = useTableState();
  const query = useQuery(
    orpc.admin.user.listUsers.queryOptions({
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
      <PageHeader title="Користувачі" description="Усі облікові записи платформи, незалежно від майстерні" />
      <TableFrame
        search={table.search}
        onSearch={table.onSearch}
        searchPlaceholder="Імʼя або email"
        page={table.page}
        totalPages={query.data?.totalPages ?? 0}
        total={query.data?.total ?? 0}
        onPageChange={table.setPage}
        isLoading={query.isLoading}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Імʼя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Майстерні</TableHead>
              <TableHead>Роль</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Користувачів не знайдено
                </TableCell>
              </TableRow>
            ) : null}
            {query.data?.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <NameCell icon={user.isPlatformAdmin ? ShieldIcon : UserRoundIcon}>
                    <Link to="/users/$userId" params={{ userId: user.id }} className="font-medium hover:underline">
                      {user.name}
                    </Link>
                  </NameCell>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell>{user.employeeMembershipCount}</TableCell>
                <TableCell>
                  <Badge variant={user.isPlatformAdmin ? "default" : "secondary"}>
                    {user.isPlatformAdmin ? "Адмін" : "Користувач"}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableFrame>
    </div>
  );
};
