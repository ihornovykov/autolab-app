import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import { PublicBookingView } from "@/views/booking/public-booking-view";

export const Route = createFileRoute("/_guest/booking/$token")({
  head: () => ({
    meta: [{ title: "Запис | Autolab" }],
  }),
  loader: ({ context, params }) => {
    void context.queryClient.prefetchQuery(
      orpc.booking.getPublicBooking.queryOptions({
        input: { token: params.token },
      }),
    );
  },
  component: PublicBookingView,
});
