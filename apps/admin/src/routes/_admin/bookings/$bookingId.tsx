import { createFileRoute } from "@tanstack/react-router";

import { BookingDetailView } from "@/views/admin/booking-detail-view";

export const Route = createFileRoute("/_admin/bookings/$bookingId")({
  component: () => {
    const { bookingId } = Route.useParams();
    return <BookingDetailView bookingId={bookingId} />;
  },
});
