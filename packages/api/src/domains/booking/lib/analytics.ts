import { db } from "@autolab/db";
import { bookingServices, bookings } from "@autolab/db/schema/booking";
import { clients } from "@autolab/db/schema/client";
import { services } from "@autolab/db/schema/service";
import dayjs from "dayjs";
import "dayjs/locale/uk.js";
import { and, asc, count, desc, eq, gte, lte, sql, sum } from "drizzle-orm";

import type { z } from "zod";

import type { organizationAnalyticsOutputSchema } from "../validation";

dayjs.locale("uk");

type AnalyticsSummary = {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  inProgressBookings: number;
  pendingBookings: number;
  totalRevenue: string;
  averageTicket: string;
  newClients: number;
};

const bookingRangeCondition = (
  organizationId: string,
  from: Date,
  to: Date,
) =>
  and(
    eq(bookings.organizationId, organizationId),
    gte(bookings.startTime, from),
    lte(bookings.startTime, to),
  );

const toRevenue = (value: string | null | undefined) => value ?? "0";

const calcDeltaPercent = (current: number, previous: number) => {
  if (previous === 0) return current === 0 ? 0 : null;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

const calcRevenueDeltaPercent = (current: string, previous: string) => {
  const currentValue = Number(current);
  const previousValue = Number(previous);
  if (previousValue === 0) return currentValue === 0 ? 0 : null;
  return Number((((currentValue - previousValue) / previousValue) * 100).toFixed(1));
};

const fetchSummary = async (
  organizationId: string,
  from: Date,
  to: Date,
): Promise<AnalyticsSummary> => {
  const range = bookingRangeCondition(organizationId, from, to);

  const statusRows = await db
    .select({
      status: bookings.status,
      count: count(),
      revenue: sum(bookings.totalPrice),
    })
    .from(bookings)
    .where(range)
    .groupBy(bookings.status);

  const statusMap = new Map(
    statusRows.map((row) => [row.status, row] as const),
  );

  const [newClientsResult] = await db
    .select({ count: count() })
    .from(clients)
    .where(
      and(
        eq(clients.organizationId, organizationId),
        gte(clients.createdAt, from),
        lte(clients.createdAt, to),
      ),
    );

  const completedBookings = statusMap.get("COMPLETED")?.count ?? 0;
  const totalRevenue = toRevenue(statusMap.get("COMPLETED")?.revenue);
  const averageTicket =
    completedBookings > 0
      ? (Number(totalRevenue) / completedBookings).toFixed(2)
      : "0";

  return {
    totalBookings: statusRows.reduce((acc, row) => acc + row.count, 0),
    completedBookings,
    cancelledBookings: statusMap.get("CANCELLED")?.count ?? 0,
    inProgressBookings: statusMap.get("IN_PROGRESS")?.count ?? 0,
    pendingBookings: statusMap.get("PENDING")?.count ?? 0,
    totalRevenue,
    averageTicket,
    newClients: newClientsResult?.count ?? 0,
  };
};

const withComparison = (
  current: AnalyticsSummary,
  previous: AnalyticsSummary,
) => ({
  ...current,
  totalBookingsDeltaPercent: calcDeltaPercent(
    current.totalBookings,
    previous.totalBookings,
  ),
  completedBookingsDeltaPercent: calcDeltaPercent(
    current.completedBookings,
    previous.completedBookings,
  ),
  totalRevenueDeltaPercent: calcRevenueDeltaPercent(
    current.totalRevenue,
    previous.totalRevenue,
  ),
  averageTicketDeltaPercent: calcRevenueDeltaPercent(
    current.averageTicket,
    previous.averageTicket,
  ),
  newClientsDeltaPercent: calcDeltaPercent(current.newClients, previous.newClients),
});

export const collectOrganizationAnalytics = async ({
  organizationId,
  from,
  to,
}: {
  organizationId: string;
  from: Date;
  to: Date;
}): Promise<z.infer<typeof organizationAnalyticsOutputSchema>> => {
  const durationMs = to.getTime() - from.getTime();
  const previousFrom = new Date(from.getTime() - durationMs);
  const previousTo = new Date(from.getTime() - 1);

  const [currentSummary, previousSummary] = await Promise.all([
    fetchSummary(organizationId, from, to),
    fetchSummary(organizationId, previousFrom, previousTo),
  ]);

  const revenueTimeSeriesRows = await db
    .select({
      date: sql<string>`to_char(date_trunc('day', ${bookings.startTime}), 'YYYY-MM-DD')`,
      revenue: sum(bookings.totalPrice),
      bookingsCount: count(),
    })
    .from(bookings)
    .where(
      and(
        bookingRangeCondition(organizationId, from, to),
        eq(bookings.status, "COMPLETED"),
      ),
    )
    .groupBy(sql`date_trunc('day', ${bookings.startTime})`)
    .orderBy(asc(sql`date_trunc('day', ${bookings.startTime})`));

  const statusBreakdownRows = await db
    .select({
      status: bookings.status,
      count: count(),
      revenue: sum(bookings.totalPrice),
    })
    .from(bookings)
    .where(bookingRangeCondition(organizationId, from, to))
    .groupBy(bookings.status);

  const topServicesRows = await db
    .select({
      serviceId: services.id,
      title: services.title,
      count: sql<number>`sum(${bookingServices.quantity})`.mapWith(Number),
      revenue: sql<string>`sum(cast(${bookingServices.unitPrice} as numeric) * ${bookingServices.quantity})`,
    })
    .from(bookingServices)
    .innerJoin(bookings, eq(bookingServices.bookingId, bookings.id))
    .innerJoin(services, eq(bookingServices.serviceId, services.id))
    .where(
      and(
        bookingRangeCondition(organizationId, from, to),
        eq(bookings.status, "COMPLETED"),
      ),
    )
    .groupBy(services.id, services.title)
    .orderBy(desc(count()))
    .limit(5);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
    summary: withComparison(currentSummary, previousSummary),
    revenueTimeSeries: revenueTimeSeriesRows.map((row) => ({
      date: row.date,
      revenue: toRevenue(row.revenue),
      bookingsCount: row.bookingsCount,
    })),
    statusBreakdown: statusBreakdownRows.map((row) => ({
      status: row.status,
      count: row.count,
      revenue: toRevenue(row.revenue),
    })),
    topServices: topServicesRows.map((row) => ({
      serviceId: row.serviceId,
      title: row.title,
      count: row.count,
      revenue: toRevenue(row.revenue),
    })),
  };
};
