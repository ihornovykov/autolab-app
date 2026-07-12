import dayjs from "dayjs";

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
