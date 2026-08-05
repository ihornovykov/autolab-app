import { useNavigate } from "@tanstack/react-router";

import type { BookingRow } from "@/features/booking/lib/types";
import { formatDate } from "@/shared/lib/date";
import { formatPrice } from "@/shared/lib/money";
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
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

const AnalyticsBookingMobileCard = ({
  booking,
  onClick,
}: {
  booking: BookingRow;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="flex w-full flex-col gap-2 border-b border-border/60 px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-muted/20"
  >
    <div className="flex items-start justify-between gap-3">
      <StatusLight status={booking.status} className="text-sm font-medium" />
      <p className="shrink-0 text-sm font-semibold tabular-nums">{formatPrice(booking.totalPrice)}</p>
    </div>
    <p className="text-sm text-muted-foreground">{formatDate(booking.startTime, "datetime")}</p>
    <p className="text-sm font-medium">
      {booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : "—"}
    </p>
    {booking.employee?.name ? (
      <p className="text-sm text-muted-foreground">{booking.employee.name}</p>
    ) : null}
  </button>
);

export const AnalyticsBookingsTable = ({
  bookings,
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
    });
  };

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="text-base">Останні записи за період</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {total || isLoading ? (
          <>
            <div className={cn("md:hidden", isLoading && "opacity-60")}>
              {isLoading && !bookings.length
                ? Array.from({ length: Math.min(pageSize, 4) }, (_, index) => (
                    <div key={index} className="space-y-2 border-b border-border/60 px-4 py-3">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))
                : bookings.map((booking) => (
                    <AnalyticsBookingMobileCard
                      key={booking.id}
                      booking={booking}
                      onClick={() => handleRowClick(booking.id)}
                    />
                  ))}
            </div>

            <div className={cn("hidden overflow-x-auto md:block", isLoading && "opacity-60")}>
              <div className="px-4 sm:px-6">
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
                              {formatDate(booking.startTime, "datetime")}
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
          <p className="px-4 pb-6 text-sm text-muted-foreground sm:px-6">
            Немає записів за обраний період
          </p>
        )}
      </CardContent>
    </Card>
  );
};
