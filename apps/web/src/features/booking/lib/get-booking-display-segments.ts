import {
  DEFAULT_WORKING_HOURS,
  resolveCalendarSegments,
  type WorkingHoursEntry,
} from "@autolab/api/lib/working-hours";

type BookingForSegments = {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  allowsOvertime?: boolean;
  employeeWorkingHours?: WorkingHoursEntry[];
};

export const getBookingDisplaySegments = (booking: BookingForSegments) =>
  resolveCalendarSegments(
    booking.id,
    new Date(booking.startTime),
    new Date(booking.endTime),
    booking.employeeWorkingHours ?? DEFAULT_WORKING_HOURS,
    booking.allowsOvertime ?? false,
  );
