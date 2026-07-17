import { useNavigate } from "@tanstack/react-router";

import type { BookingRow } from "@/features/booking/lib/booking-row";
import { formatDateTime, formatPrice } from "@/shared/lib/format";
import { DataTablePagination } from "@/shared/ui/data-table-pagination";
import { StatusLight } from "@/shared/ui/status-light";
import { Card, CardContent, CardHeader, CardTitle } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@autolab/ui/components/table";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  bookings: BookingRow[];
  organizationId: string;
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

export const AnalyticsBookingsTable = ({
  bookings,
  organizationId,
  page,
  totalPages,
  total,
  pageSize,
  isLoading = false,
  onPageChange,
}: Props) => {
  const navigate = useNavigate();

  const handleRowClick = (bookingId: string) => {
    navigate({
      to: "/dashboard/organization/bookings/$bookingId",
      params: { bookingId },
      search: { organizationId },
    });
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base">Останні записи за період</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {total || isLoading ? (
          <>
            <div className={cn("px-6", isLoading && "opacity-60")}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Дата</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Авто</TableHead>
                    <TableHead>Майстер</TableHead>
                    <TableHead className="text-right">Сума</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && !bookings.length
                    ? Array.from({ length: pageSize }, (_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-28" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-32" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-24" />
                          </TableCell>
                          <TableCell className="text-right">
                            <Skeleton className="ml-auto h-4 w-16" />
                          </TableCell>
                        </TableRow>
                      ))
                    : bookings.map((booking) => (
                        <TableRow
                          key={booking.id}
                          className="cursor-pointer"
                          onClick={() => handleRowClick(booking.id)}
                        >
                          <TableCell className="whitespace-nowrap">
                            {formatDateTime(booking.startTime)}
                          </TableCell>
                          <TableCell>
                            <StatusLight status={booking.status} />
                          </TableCell>
                          <TableCell>
                            {booking.vehicle
                              ? `${booking.vehicle.make} ${booking.vehicle.model}`
                              : "—"}
                          </TableCell>
                          <TableCell>{booking.employee?.name ?? "—"}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatPrice(booking.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                </TableBody>
              </Table>
            </div>
            <DataTablePagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={onPageChange}
            />
          </>
        ) : (
          <p className="px-6 pb-6 text-sm text-muted-foreground">Немає записів за обраний період</p>
        )}
      </CardContent>
    </Card>
  );
};
