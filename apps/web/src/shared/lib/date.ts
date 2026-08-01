import dayjs from "dayjs";
import "dayjs/locale/uk";

dayjs.locale("uk");

export const dateFormats = {
  date: "D MMM YYYY",
  iso: "YYYY-MM-DD",
  datetime: "D MMM YYYY, HH:mm",
} as const;

export type DateFormat = keyof typeof dateFormats;

export const formatDate = (value: string | Date, format: DateFormat = "date") =>
  dayjs(value).format(dateFormats[format]);
