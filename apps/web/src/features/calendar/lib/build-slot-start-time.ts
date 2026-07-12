import dayjs from "dayjs";

import { DefaultStartHour } from "@/features/calendar/lib/constants";

export const buildSlotStartTime = (date: Date, time?: number) => {
  if (time === undefined) {
    return dayjs(date).hour(DefaultStartHour).minute(0).second(0).format("YYYY-MM-DDTHH:mm");
  }

  const hours = Math.floor(time);
  const minutes = Math.round((time - hours) * 60);

  return dayjs(date).hour(hours).minute(minutes).second(0).format("YYYY-MM-DDTHH:mm");
};
