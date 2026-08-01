export type CalendarView = "month" | "week" | "day";

export type BookingStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";

export type CalendarEvent = {
  id: string;
  bookingId: string;
  segmentIndex: number;
  segmentCount: number;
  startTime: Date;
  endTime: Date;
  status: BookingStatus;
  totalPrice: number;
  vehicle: {
    id: string;
    make: string;
    model: string;
    licensePlate: string | null;
  };
};

export type CalendarRange = {
  from: string;
  to: string;
};

export type PositionedCalendarEvent = {
  event: CalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
  zIndex: number;
};
