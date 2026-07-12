import dayjs from "dayjs";

import { type DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";

export const toListBookingsDateRange = (value: DateRangeFilterValue | null) => {
  if (!value?.from) return {};

  return {
    from: dayjs(value.from).startOf("day").toISOString(),
    to: dayjs(value.to ?? value.from).endOf("day").toISOString(),
  };
};

export const hasDateRangeFilter = (value: DateRangeFilterValue | null) => Boolean(value?.from);
