import dayjs from "dayjs";
import "dayjs/locale/uk";

dayjs.locale("uk");

export const formatDate = (value: string | Date) => dayjs(value).format("D MMM YYYY");

export const formatDateISO = (value: string | Date) => dayjs(value).format("YYYY-MM-DD");

export const formatDateTime = (value: string | Date) => dayjs(value).format("D MMM YYYY, HH:mm");

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

export const getClientDisplayName = (client: {
  firstName: string;
  lastName?: string | null;
}) => [client.firstName, client.lastName].filter(Boolean).join(" ");
