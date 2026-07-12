import dayjs from "dayjs";

import { type BookingRow } from "@/features/booking/lib/booking-row";

export type BookingDateGroup = {
  key: string;
  label: string;
  bookings: BookingRow[];
};

const getGroupLabel = (dateKey: string, today: dayjs.Dayjs) => {
  const day = dayjs(dateKey);

  if (day.isSame(today, "day")) return "Сьогодні";
  if (day.isSame(today.add(1, "day"), "day")) return "Завтра";
  if (day.isSame(today.subtract(1, "day"), "day")) return "Вчора";

  return day.format("dddd, D MMMM");
};

export const groupBookingsByDate = (
  bookings: BookingRow[],
  options?: { pastOnly?: boolean },
): BookingDateGroup[] => {
  const today = dayjs().startOf("day");
  const groups = new Map<string, BookingRow[]>();

  for (const booking of bookings) {
    const key = dayjs(booking.startTime).format("YYYY-MM-DD");
    const existing = groups.get(key) ?? [];
    existing.push(booking);
    groups.set(key, existing);
  }

  const sortedKeys = [...groups.keys()].sort((a, b) => {
    if (options?.pastOnly) return dayjs(b).valueOf() - dayjs(a).valueOf();
    return dayjs(a).valueOf() - dayjs(b).valueOf();
  });

  return sortedKeys.map((key) => ({
    key,
    label: getGroupLabel(key, today),
    bookings: (groups.get(key) ?? []).sort((a, b) => {
      const diff = dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf();
      return options?.pastOnly ? -diff : diff;
    }),
  }));
};
