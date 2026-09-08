import dayjs from "dayjs";

import {
  DEFAULT_WORKING_HOURS,
  resolveCalendarSegments,
  type WorkingHoursEntry,
} from "@autolab/api/lib/schedule";
import { type DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";

import {
  type BookingDateGroup,
  type BookingLineItemForTotal,
  type BookingRow,
  type BookingServiceLineItem,
  type BookingStatusFilter,
} from "@/features/booking/lib/types";

export const computeBookingItemsTotal = (items: BookingServiceLineItem[]) =>
  items.reduce((sum, item) => sum + Number(item.unitPrice) * item.quantity, 0);

export const computeBookingSubtotal = (items: BookingLineItemForTotal[]) =>
  items.reduce((sum, item) => {
    const unitPrice = Number(item.unitPrice ?? item.price ?? 0);
    const quantity = item.quantity ?? 1;
    return sum + unitPrice * quantity;
  }, 0);

export const computeBookingDiscountAmount = (subtotal: number, totalPrice: string | number) => {
  const discount = subtotal - Number(totalPrice);
  if (discount < 0.005) return 0;
  return discount;
};

export const formatBookingTotalPrice = (value: number) => value.toFixed(2);

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

export const toListBookingsDateRange = (value: DateRangeFilterValue | null) => {
  if (!value?.from) return {};

  return {
    from: dayjs(value.from).startOf("day").toISOString(),
    to: dayjs(value.to ?? value.from).endOf("day").toISOString(),
  };
};

export const hasDateRangeFilter = (value: DateRangeFilterValue | null) => Boolean(value?.from);

export const formatBookingTimeRange = (startTime: string | Date, endTime: string | Date) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (start.isSame(end, "day")) {
    return `${start.format("D MMM YYYY")}, ${start.format("HH:mm")} – ${end.format("HH:mm")}`;
  }

  return `${start.format("D MMM YYYY, HH:mm")} – ${end.format("D MMM YYYY, HH:mm")}`;
};

export const formatBookingTimeShort = (startTime: string | Date, endTime: string | Date) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (start.isSame(end, "day")) {
    return `${start.format("HH:mm")} – ${end.format("HH:mm")}`;
  }

  return `${start.format("D MMM, HH:mm")} – ${end.format("D MMM, HH:mm")}`;
};

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

const base64ToBlob = (base64: string, contentType: string) => {
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new Blob([bytes], { type: contentType });
};

export const openPdfBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const printPdfBlob = (blob: Blob) => {
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.setAttribute("title", "Друк акта");
  Object.assign(iframe.style, {
    position: "fixed",
    right: "0",
    bottom: "0",
    width: "0",
    height: "0",
    border: "0",
    visibility: "hidden",
  });

  let isCleanedUp = false;
  const cleanup = () => {
    if (isCleanedUp) return;
    isCleanedUp = true;
    iframe.remove();
    URL.revokeObjectURL(url);
  };

  iframe.src = url;
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    iframe.contentWindow?.addEventListener("afterprint", cleanup, { once: true });
    window.setTimeout(cleanup, 2000);
  };

  document.body.appendChild(iframe);
};

export const downloadPdfBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
};

export const createPdfBlobFromBase64 = (pdfBase64: string, contentType = "application/pdf") =>
  base64ToBlob(pdfBase64, contentType);
