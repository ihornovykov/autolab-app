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
import { CalendarIcon } from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import { useTableState } from "@/shared/hooks/use-table-state";
import { NameCell, PAGE_SIZE, TableFrame } from "@/shared/ui/admin-table";
import { PageHeader } from "@/shared/ui/admin-shell";

const statusVariant = {
  PENDING: "yellow",
  IN_PROGRESS: "blue",
  COMPLETED: "green",
  CANCELLED: "secondary",
} as const;

const statusLabel = {
  PENDING: "Очікує",
  IN_PROGRESS: "В роботі",
  COMPLETED: "Виконано",
  CANCELLED: "Скасовано",
} as const;

export const BookingsView = () => {
  const table = useTableState();
  const query = useQuery(
    orpc.admin.booking.listBookings.queryOptions({
      input: { search: table.search || undefined, page: table.page, pageSize: PAGE_SIZE },
    }),
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Записи" description="Візити по всіх майстернях" />
      <TableFrame
        search={table.search}
        onSearch={table.onSearch}
        searchPlaceholder="Майстерня або номер авто"
        page={table.page}
        totalPages={query.data?.totalPages ?? 0}
        total={query.data?.total ?? 0}
        onPageChange={table.setPage}
        isLoading={query.isLoading}
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Час</TableHead>
              <TableHead>Майстерня</TableHead>
              <TableHead>Авто</TableHead>
              <TableHead>Статус</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                  Записів не знайдено
                </TableCell>
              </TableRow>
            ) : null}
            {query.data?.items.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  <NameCell icon={CalendarIcon}>
                    <Link
                      to="/bookings/$bookingId"
                      params={{ bookingId: booking.id }}
                      className="font-medium hover:underline"
                    >
                      {new Date(booking.startTime).toLocaleString("uk-UA")}
                    </Link>
                  </NameCell>
                </TableCell>
                <TableCell>
                  <Link
                    to="/organizations/$organizationId"
                    params={{ organizationId: booking.organization.id }}
                    className="hover:underline"
                  >
                    {booking.organization.name}
                  </Link>
                </TableCell>
                <TableCell>
                  {booking.vehicle.make} {booking.vehicle.model}
                </TableCell>
                <TableCell>
                  <Badge variant={statusVariant[booking.status]}>{statusLabel[booking.status]}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableFrame>
    </div>
  );
};
