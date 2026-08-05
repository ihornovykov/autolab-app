import type { DateRangeFilterValue } from "@autolab/ui/components/date-range-picker";
import dayjs from "dayjs";
import { createParser, parseAsInteger, parseAsString } from "nuqs";

export const parseAsPage = parseAsInteger.withDefault(1);

export const parseAsSearchQuery = parseAsString.withDefault("");

export const parseAsDateParam = createParser({
  parse: (value) => (dayjs(value, "YYYY-MM-DD", true).isValid() ? value : null),
  serialize: (value) => value,
});

export const toDateRangeFilter = (
  from: string | null,
  to: string | null,
): DateRangeFilterValue | null => {
  if (!from) return null;
  return { from, to: to ?? undefined };
};

export const fromDateRangeFilter = (value: DateRangeFilterValue | null) => ({
  from: value?.from ?? null,
  to: value?.to ?? null,
});
