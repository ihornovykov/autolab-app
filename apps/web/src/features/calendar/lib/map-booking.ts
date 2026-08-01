import {
  DEFAULT_WORKING_HOURS,
  resolveCalendarSegments,
  type WorkingHoursEntry,
} from "@autolab/api/lib/working-hours";

import { type VehicleBookingHistoryItem } from "@/features/booking/lib/booking-history-item";
import { type CalendarEvent } from "@/features/calendar/lib/types";

type BookingWithRelations = {
  id: string;
  employeeId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  startTime: Date | string;
  endTime: Date | string;
  allowsOvertime?: boolean;
  notes?: string | null;
  totalPrice: string;
  employeeWorkingHours?: WorkingHoursEntry[];
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year?: number;
    licensePlate: string | null;
  };
  employee?: {
    id: string;
    userId: string;
    role: "TECHNICIAN" | "MANAGER" | "OWNER";
    name?: string;
  };
  services?: Array<{
    id: string;
    title: string;
    price?: string;
    unitPrice?: string;
    quantity?: number;
    duration?: number;
  }>;
};

const toCalendarEvent = (
  booking: BookingWithRelations,
  segment: { id: string; startTime: Date; endTime: Date },
  segmentIndex: number,
  segmentCount: number,
): CalendarEvent => ({
  id: segment.id,
  bookingId: booking.id,
  segmentIndex,
  segmentCount,
  startTime: segment.startTime,
  endTime: segment.endTime,
  status: booking.status,
  totalPrice: Number(booking.totalPrice),
  vehicle: {
    id: booking.vehicle?.id ?? "",
    make: booking.vehicle?.make ?? "—",
    model: booking.vehicle?.model ?? "",
    licensePlate: booking.vehicle?.licensePlate ?? null,
  },
});

export const mapBookingsToCalendarEvents = (bookings: BookingWithRelations[]): CalendarEvent[] =>
  bookings.flatMap((booking) => {
    const startTime = new Date(booking.startTime);
    const endTime = new Date(booking.endTime);
    const schedule = booking.employeeWorkingHours ?? DEFAULT_WORKING_HOURS;
    const segments = resolveCalendarSegments(
      booking.id,
      startTime,
      endTime,
      schedule,
      booking.allowsOvertime ?? false,
    );

    return segments.map((segment, index) =>
      toCalendarEvent(booking, segment, index, segments.length),
    );
  });

export const mapBookingToCalendarEvent = (booking: BookingWithRelations): CalendarEvent =>
  mapBookingsToCalendarEvents([booking])[0]!;

export const mapBookingToHistoryItem = (booking: BookingWithRelations): VehicleBookingHistoryItem => ({
  id: booking.id,
  employeeId: booking.employeeId,
  status: booking.status,
  startTime: new Date(booking.startTime),
  endTime: new Date(booking.endTime),
  allowsOvertime: booking.allowsOvertime ?? false,
  notes: booking.notes,
  totalPrice: booking.totalPrice,
  services: booking.services,
});
