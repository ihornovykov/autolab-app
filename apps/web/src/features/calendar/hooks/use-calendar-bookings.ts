import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";

import {
  createCalendarBookingsInput,
  getExtendedCalendarPrefetchRanges,
  getCalendarFetchRange,
} from "@/features/calendar/lib/utils";
import { useCalendarFilters } from "@/features/calendar/hooks/use-calendar-filters";
import { orpc } from "@/shared/api/orpc";

export const useCalendarBookings = (organizationId: string | null) => {
  const queryClient = useQueryClient();
  const { view, currentDate } = useCalendarFilters();

  const range = useMemo(() => getCalendarFetchRange(view, currentDate), [view, currentDate]);
  const prefetchRanges = useMemo(
    () => getExtendedCalendarPrefetchRanges(view, currentDate),
    [view, currentDate],
  );

  const query = useQuery({
    ...orpc.booking.listBookings.queryOptions({
      input: createCalendarBookingsInput(organizationId!, range),
    }),
    enabled: !!organizationId,
  });

  useEffect(() => {
    if (!organizationId) return;

    for (const nextRange of prefetchRanges) {
      queryClient.prefetchQuery(
        orpc.booking.listBookings.queryOptions({
          input: createCalendarBookingsInput(organizationId, nextRange),
        }),
      );
    }
  }, [organizationId, prefetchRanges, queryClient]);

  return {
    ...query,
    bookings: query.data?.items ?? [],
  };
};
