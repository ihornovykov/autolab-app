import { createFileRoute } from "@tanstack/react-router";

import { BookingsView } from "@/views/admin/bookings-view";

export const Route = createFileRoute("/_admin/bookings/")({
  component: BookingsView,
});
