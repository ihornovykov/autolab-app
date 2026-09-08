import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";

import { BookingDetailContent } from "@/features/booking/ui/booking-detail-content";
import { BookingDetailSkeleton } from "@/features/booking/ui/booking-detail-skeleton";
import { orpc } from "@/shared/api/orpc";
import { isQueryContentLoading } from "@/shared/lib/query";

export const PublicBookingView = () => {
  const { token } = useParams({ from: "/_guest/booking/$token" });

  const bookingQuery = useQuery({
    ...orpc.booking.getPublicBooking.queryOptions({
      input: { token },
    }),
  });

  if (isQueryContentLoading(bookingQuery)) return <BookingDetailSkeleton />;

  const booking = bookingQuery.data;
  if (!booking) {
    return <p className="text-sm text-muted-foreground">Запис не знайдено</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Запис
        </p>
        <h2 className="text-lg font-semibold tracking-tight">{booking.organization.name}</h2>
      </div>
      <BookingDetailContent
        booking={booking}
        vehicle={booking.vehicle}
        clientName={booking.client?.name}
        hideTime
        showTotalAtBottom
      />
    </div>
  );
};
