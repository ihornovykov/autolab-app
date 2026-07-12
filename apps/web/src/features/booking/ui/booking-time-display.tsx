import { CornerDownRight } from "lucide-react";
import { useMemo } from "react";

import { getBookingDisplaySegments } from "@/features/booking/lib/get-booking-display-segments";
import { formatBookingTimeRange } from "@/features/booking/lib/format-booking-time";
import { type WorkingHoursEntry } from "@autolab/api/lib/working-hours";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  booking: {
    id: string;
    startTime: Date | string;
    endTime: Date | string;
    allowsOvertime?: boolean;
    employeeWorkingHours?: WorkingHoursEntry[];
  };
  className?: string;
};

export const BookingTimeDisplay = ({ booking, className }: Props) => {
  const segments = useMemo(() => getBookingDisplaySegments(booking), [booking]);

  if (segments.length <= 1) {
    return (
      <p className={cn("text-sm", className)}>
        {formatBookingTimeRange(booking.startTime, booking.endTime)}
      </p>
    );
  }

  return (
    <ul className={cn("space-y-2", className)}>
      {segments.map((segment, index) => (
        <li key={segment.id} className="flex items-start gap-2 text-sm">
          {index > 0 ? (
            <CornerDownRight
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          ) : (
            <span className="size-4 shrink-0" aria-hidden />
          )}
          <span>{formatBookingTimeRange(segment.startTime, segment.endTime)}</span>
        </li>
      ))}
    </ul>
  );
};
