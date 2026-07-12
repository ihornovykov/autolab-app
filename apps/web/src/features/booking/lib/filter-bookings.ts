import { type BookingRow } from "@/features/booking/lib/booking-row";

export type BookingStatusFilter = "ALL" | BookingRow["status"];

const matchesSearch = (booking: BookingRow, search: string) => {
  const query = search.trim().toLowerCase();
  if (!query) return true;

  const vehicle = booking.vehicle;
  const haystack = [
    vehicle?.make,
    vehicle?.model,
    vehicle?.licensePlate,
    booking.notes,
    ...(booking.services?.map((service) => service.title) ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
};

export const filterBookings = (
  bookings: BookingRow[],
  {
    search,
    status,
    showCancelled,
  }: {
    search: string;
    status: BookingStatusFilter;
    showCancelled: boolean;
  },
) =>
  bookings.filter((booking) => {
    if (!showCancelled && booking.status === "CANCELLED") return false;
    if (status !== "ALL" && booking.status !== status) return false;
    return matchesSearch(booking, search);
  });
