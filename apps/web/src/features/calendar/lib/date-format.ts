import { format } from "date-fns";
import { uk } from "date-fns/locale";

export const formatMonthYear = (date: Date) => format(date, "LLLL yyyy", { locale: uk });

export const formatMonth = (date: Date) => format(date, "MMM", { locale: uk });

export const formatDayDate = (date: Date) => format(date, "EEEEEE", { locale: uk });

export const getTime = (date: Date): string =>
  date.toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
