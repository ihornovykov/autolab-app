import dayjs from "dayjs";
import "dayjs/locale/uk.js";

dayjs.locale("uk");

export const formatPrice = (value: string | number) =>
  new Intl.NumberFormat("uk-UA", {
    style: "currency",
    currency: "UAH",
    maximumFractionDigits: 0,
  }).format(Number(value));

export const getClientName = (client: {
  firstName: string;
  lastName?: string | null;
  middleName?: string | null;
}) => [client.lastName, client.firstName, client.middleName].filter(Boolean).join(" ");

export const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes} хв`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder ? `${hours} год ${remainder} хв` : `${hours} год`;
};

export const formatBookingTimeRange = (startTime: string | Date, endTime: string | Date) => {
  const start = dayjs(startTime);
  const end = dayjs(endTime);

  if (start.isSame(end, "day")) {
    return `${start.format("D MMM YYYY")}, ${start.format("HH:mm")} – ${end.format("HH:mm")}`;
  }

  return `${start.format("D MMM YYYY, HH:mm")} – ${end.format("D MMM YYYY, HH:mm")}`;
};
