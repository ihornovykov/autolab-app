import { db } from "@autolab/db";
import { bookingServices, bookings } from "@autolab/db/schema/booking";
import { clients } from "@autolab/db/schema/client";
import { employees } from "@autolab/db/schema/employee";
import { services } from "@autolab/db/schema/service";
import { vehicles } from "@autolab/db/schema/vehicle";
import { ORPCError } from "@orpc/server";
import dayjs from "dayjs";
import { and, count, desc, eq, gte, inArray, lt, lte, ne, or, sql, sum } from "drizzle-orm";

import type { AuthenticatedContext } from "../../context";
import { getWorkingHoursForUserId, getWorkingHoursForUserIds } from "../profile/services";
import { buildAnalyticsReportFilename, buildBookingReceiptFilename } from "../../lib/filename";
import { createId, getOrgContext } from "../../lib/scope";
import { buildPaginatedResult, getOffset, searchPattern } from "../../lib/pagination";
import { ilikeHomoglyph } from "../../lib/normalize";
import { buildVehicleSearchCondition } from "../../lib/vehicle";
import { DEFAULT_WORKING_HOURS, resolveBookingEndTime } from "../../lib/schedule";

import type { z } from "zod";

import type {
  createBookingInputSchema,
  dashboardStatsInputSchema,
  dashboardStatsOutputSchema,
  getBookingInputSchema,
  getBookingReceiptPdfInputSchema,
  listBookingsInputSchema,
  listBookingsOutputSchema,
  organizationAnalyticsBookingsInputSchema,
  organizationAnalyticsBookingsOutputSchema,
  organizationAnalyticsInputSchema,
  organizationAnalyticsOutputSchema,
  updateBookingInputSchema,
  updateBookingStatusInputSchema,
} from "./validation";
import type {
  listVehicleBookingsInputSchema,
  listVehicleBookingsOutputSchema,
} from "../vehicle/validation";
import { getOrganizationById } from "../organization/services";
import { getVehicleById } from "../vehicle/services";
import {
  assertEndTimeAfterStart,
  bookingWith,
  buildBookingReceiptPdf,
  buildOrganizationAnalyticsPdf,
  calculateBookingDuration,
  collectOrganizationAnalytics,
  getListBookingsOrder,
  mapBooking,
  mapReportBooking,
  mapVehicleBookingListItem,
  reportBookingWith,
} from "./utils";
import type { ResolvedBookingItem } from "./utils";

const resolveBookingItems = async (
  organizationId: string,
  items: Array<{ serviceId: string; quantity: number; unitPrice: string }>,
) => {
  const uniqueIds = [...new Set(items.map((item) => item.serviceId))];

  const selected = await db.query.services.findMany({
    where: and(inArray(services.id, uniqueIds), eq(services.organizationId, organizationId)),
  });

  if (selected.length !== uniqueIds.length) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid service selection" });
  }

  const serviceMap = new Map(selected.map((service) => [service.id, service]));

  let total = 0;
  let duration = 0;

  const resolved: ResolvedBookingItem[] = items.map((item) => {
    const service = serviceMap.get(item.serviceId);
    if (!service) {
      throw new ORPCError("BAD_REQUEST", { message: "Invalid service selection" });
    }

    const unitPrice = Number(item.unitPrice).toFixed(2);
    total += Number(unitPrice) * item.quantity;
    duration += service.duration * item.quantity;

    return {
      serviceId: item.serviceId,
      quantity: item.quantity,
      unitPrice,
      duration: service.duration,
    };
  });

  return { total: total.toFixed(2), duration, items: resolved, selected };
};

const resolveEndTimeForBooking = async (
  employeeId: string,
  startTime: Date,
  items: ResolvedBookingItem[],
) => {
  const employee = await db.query.employees.findFirst({
    where: eq(employees.id, employeeId),
    columns: { userId: true },
  });

  if (!employee) {
    throw new ORPCError("BAD_REQUEST", { message: "Invalid employee" });
  }

  const duration = calculateBookingDuration(items);
  const schedule = await getWorkingHoursForUserId(employee.userId);
  return resolveBookingEndTime(startTime, duration, schedule);
};

const attachWorkingHours = async <T extends { employee?: { userId: string } | null }>(
  rows: T[],
) => {
  const userIds = rows
    .map((row) => row.employee?.userId)
    .filter((userId): userId is string => Boolean(userId));

  const hoursMap = await getWorkingHoursForUserIds(userIds);

  return rows.map((row) => ({
    row,
    employeeWorkingHours: row.employee?.userId
      ? (hoursMap.get(row.employee.userId) ?? DEFAULT_WORKING_HOURS)
      : DEFAULT_WORKING_HOURS,
  }));
};

export const listBookings = async (
  context: AuthenticatedContext,
  input: z.infer<typeof listBookingsInputSchema>,
): Promise<z.infer<typeof listBookingsOutputSchema>> => {
  const org = await getOrgContext(context, input.organizationId);
  const isRangeQuery = Boolean(input.from && input.to);
  const page = isRangeQuery ? 1 : (input.page ?? 1);
  const pageSize = isRangeQuery ? 500 : (input.pageSize ?? 25);
  const offset = isRangeQuery ? 0 : getOffset(page, pageSize);
  const pattern = searchPattern(input.search);

  const conditions = [eq(bookings.organizationId, org.organizationId)];

  if (input.from) {
    conditions.push(gte(bookings.endTime, new Date(input.from)));
  }
  if (input.to) {
    conditions.push(lte(bookings.startTime, new Date(input.to)));
  }
  if (input.includeCancelled === false) {
    conditions.push(ne(bookings.status, "CANCELLED"));
  }
  const hasDateRange = Boolean(input.from || input.to);
  const startOfToday = dayjs().startOf("day").toDate();

  if (!hasDateRange) {
    if (input.includePast === true) {
      conditions.push(lt(bookings.startTime, startOfToday));
    } else {
      conditions.push(gte(bookings.startTime, startOfToday));
    }
  }
  if (input.status) {
    conditions.push(eq(bookings.status, input.status));
  }
  if (pattern) {
    const vehicleMatch = buildVehicleSearchCondition(
      {
        make: vehicles.make,
        model: vehicles.model,
        licensePlate: vehicles.licensePlate,
      },
      input.search ?? "",
    );

    conditions.push(
      or(
        sql`exists (
          select 1 from ${vehicles}
          where ${vehicles.id} = ${bookings.vehicleId}
          and ${vehicleMatch}
        )`,
        ilikeHomoglyph(bookings.notes, pattern)!,
        sql`exists (
          select 1 from ${bookingServices}
          inner join ${services} on ${services.id} = ${bookingServices.serviceId}
          where ${bookingServices.bookingId} = ${bookings.id}
          and ${ilikeHomoglyph(services.title, pattern)}
        )`,
      )!,
    );
  }

  const whereClause = and(...conditions);
  const order = getListBookingsOrder(input.sort, input.includePast);

  const [totalResult] = await db.select({ count: count() }).from(bookings).where(whereClause);
  const total = totalResult?.count ?? 0;

  const idRows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(whereClause)
    .orderBy(...order)
    .limit(pageSize)
    .offset(offset);

  if (idRows.length === 0) {
    return buildPaginatedResult([], total, page, pageSize);
  }

  const idOrder = new Map(idRows.map((row, index) => [row.id, index]));

  const rows = await db.query.bookings.findMany({
    where: inArray(
      bookings.id,
      idRows.map((row) => row.id),
    ),
    with: bookingWith,
  });

  const orderedRows = [...rows].sort((a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0));

  const withHours = await attachWorkingHours(orderedRows);
  const items = withHours.map(({ row, employeeWorkingHours }) =>
    mapBooking(row, { employeeWorkingHours }),
  );

  return buildPaginatedResult(items, total, page, pageSize);
};

export const listVehicleBookings = async (
  context: AuthenticatedContext,
  input: z.infer<typeof listVehicleBookingsInputSchema>,
): Promise<z.infer<typeof listVehicleBookingsOutputSchema>> => {
  const org = await getOrgContext(context, input.organizationId);
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const offset = getOffset(page, pageSize);

  const whereClause = and(
    eq(bookings.organizationId, org.organizationId),
    eq(bookings.vehicleId, input.vehicleId),
  );

  const [totalResult] = await db.select({ count: count() }).from(bookings).where(whereClause);
  const total = totalResult?.count ?? 0;

  const idRows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(whereClause)
    .orderBy(desc(bookings.startTime))
    .limit(pageSize)
    .offset(offset);

  if (idRows.length === 0) {
    return buildPaginatedResult([], total, page, pageSize);
  }

  const rows = await db.query.bookings.findMany({
    where: inArray(
      bookings.id,
      idRows.map((row) => row.id),
    ),
    with: bookingWith,
    orderBy: (booking, { desc: descOrder }) => [descOrder(booking.startTime)],
  });

  const withHours = await attachWorkingHours(rows);
  const items = withHours.map(({ row, employeeWorkingHours }) =>
    mapVehicleBookingListItem(mapBooking(row, { employeeWorkingHours })),
  );

  return buildPaginatedResult(items, total, page, pageSize);
};

export const getBookingById = async (
  context: AuthenticatedContext,
  input: z.infer<typeof getBookingInputSchema>,
) => {
  const org = await getOrgContext(context, input.organizationId);
  const row = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, input.bookingId), eq(bookings.organizationId, org.organizationId)),
    with: bookingWith,
  });

  if (!row) return null;

  const schedule = row.employee?.userId
    ? await getWorkingHoursForUserId(row.employee.userId)
    : DEFAULT_WORKING_HOURS;

  return mapBooking(row, { employeeWorkingHours: schedule });
};

export const generateBookingReceiptPdf = async (
  context: AuthenticatedContext,
  input: z.infer<typeof getBookingReceiptPdfInputSchema>,
) => {
  const booking = await getBookingById(context, input);
  if (!booking) {
    throw new ORPCError("NOT_FOUND", { message: "Booking not found" });
  }

  const organization = await getOrganizationById(context, {
    organizationId: input.organizationId,
  });
  if (!organization) {
    throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
  }

  const vehicle = await getVehicleById(context, {
    organizationId: input.organizationId,
    vehicleId: booking.vehicleId,
  });

  const pdfBuffer = await buildBookingReceiptPdf({
    booking: {
      id: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: booking.status,
      totalPrice: booking.totalPrice,
      notes: booking.notes,
      allowsOvertime: booking.allowsOvertime,
      services: booking.services,
    },
    organization: {
      name: organization.name,
      logo: organization.logo,
      address: organization.address,
      phone: organization.phone,
      email: organization.email,
      website: organization.website,
    },
    vehicle: vehicle
      ? {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          vin: vehicle.vin,
          client: vehicle.client,
        }
      : booking.vehicle,
    employee: booking.employee,
  });

  return {
    pdfBase64: pdfBuffer.toString("base64"),
    filename: buildBookingReceiptFilename({
      startTime: booking.startTime,
      licensePlate: vehicle?.licensePlate ?? booking.vehicle?.licensePlate,
      make: vehicle?.make ?? booking.vehicle?.make,
      model: vehicle?.model ?? booking.vehicle?.model,
    }),
    contentType: "application/pdf" as const,
  };
};

export const createBooking = async (
  context: AuthenticatedContext,
  input: z.infer<typeof createBookingInputSchema>,
) => {
  const org = await getOrgContext(context, input.organizationId);
  const { total, items: resolvedItems } = await resolveBookingItems(
    org.organizationId,
    input.items,
  );
  const bookingId = createId();
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  assertEndTimeAfterStart(startTime, endTime);

  await db.insert(bookings).values({
    id: bookingId,
    organizationId: org.organizationId,
    employeeId: input.employeeId,
    vehicleId: input.vehicleId,
    startTime,
    endTime,
    allowsOvertime: input.allowsOvertime ?? false,
    notes: input.notes,
    totalPrice: input.totalPrice ? Number(input.totalPrice).toFixed(2) : total,
  });

  await db.insert(bookingServices).values(
    resolvedItems.map((item) => ({
      bookingId,
      serviceId: item.serviceId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      duration: item.duration,
    })),
  );

  const full = await getBookingById(context, {
    organizationId: org.organizationId,
    bookingId,
  });

  if (!full) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create booking" });
  }

  return full;
};

export const updateBooking = async (
  context: AuthenticatedContext,
  input: z.infer<typeof updateBookingInputSchema>,
) => {
  const org = await getOrgContext(context, input.organizationId);
  const existing = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, input.bookingId), eq(bookings.organizationId, org.organizationId)),
    with: bookingWith,
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Booking not found" });
  }

  let totalPrice = existing.totalPrice;
  let resolvedItems: ResolvedBookingItem[] =
    existing.bookingServices?.map((bs) => ({
      serviceId: bs.service.id,
      quantity: bs.quantity,
      unitPrice: bs.unitPrice,
      duration: bs.duration,
    })) ?? [];

  if (input.items) {
    const resolved = await resolveBookingItems(org.organizationId, input.items);
    resolvedItems = resolved.items;
    if (input.totalPrice === undefined) {
      totalPrice = resolved.total;
    }
    await db.delete(bookingServices).where(eq(bookingServices.bookingId, input.bookingId));
    await db.insert(bookingServices).values(
      resolvedItems.map((item) => ({
        bookingId: input.bookingId,
        serviceId: item.serviceId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        duration: item.duration,
      })),
    );
  }

  if (input.totalPrice !== undefined) {
    totalPrice = Number(input.totalPrice).toFixed(2);
  }

  const employeeId = input.employeeId ?? existing.employeeId;
  const startTime = input.startTime ? new Date(input.startTime) : existing.startTime;
  const endTime = input.endTime
    ? new Date(input.endTime)
    : input.startTime || input.items || input.employeeId
      ? await resolveEndTimeForBooking(employeeId, startTime, resolvedItems)
      : existing.endTime;

  assertEndTimeAfterStart(startTime, endTime);

  await db
    .update(bookings)
    .set({
      employeeId,
      startTime,
      endTime,
      allowsOvertime: input.allowsOvertime ?? existing.allowsOvertime,
      notes: input.notes ?? existing.notes,
      totalPrice,
    })
    .where(eq(bookings.id, input.bookingId));

  return getBookingById(context, {
    organizationId: org.organizationId,
    bookingId: input.bookingId,
  });
};

export const updateBookingStatus = async (
  context: AuthenticatedContext,
  input: z.infer<typeof updateBookingStatusInputSchema>,
) => {
  const org = await getOrgContext(context, input.organizationId);
  const [updated] = await db
    .update(bookings)
    .set({ status: input.status })
    .where(and(eq(bookings.id, input.bookingId), eq(bookings.organizationId, org.organizationId)))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Booking not found" });
  }

  return getBookingById(context, {
    organizationId: org.organizationId,
    bookingId: input.bookingId,
  });
};

export const deleteBooking = async (
  context: AuthenticatedContext,
  input: { organizationId: string; bookingId: string },
) => {
  const org = await getOrgContext(context, input.organizationId);
  await db
    .delete(bookings)
    .where(and(eq(bookings.id, input.bookingId), eq(bookings.organizationId, org.organizationId)));

  return { success: true as const };
};

export const getDashboardStats = async (
  context: AuthenticatedContext,
  input: z.infer<typeof dashboardStatsInputSchema>,
): Promise<z.infer<typeof dashboardStatsOutputSchema>> => {
  const org = await getOrgContext(context, input.organizationId);
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(endOfDay.getDate() + 1);

  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

  const orgId = org.organizationId;

  const todayRows = await db.query.bookings.findMany({
    where: and(
      eq(bookings.organizationId, orgId),
      gte(bookings.startTime, startOfDay),
      lte(bookings.startTime, endOfDay),
    ),
    with: bookingWith,
    orderBy: (b, { asc }) => [asc(b.startTime)],
  });

  const [inProgressResult] = await db
    .select({ count: count() })
    .from(bookings)
    .where(and(eq(bookings.organizationId, orgId), eq(bookings.status, "IN_PROGRESS")));

  const [revenueResult] = await db
    .select({ total: sum(bookings.totalPrice) })
    .from(bookings)
    .where(
      and(
        eq(bookings.organizationId, orgId),
        eq(bookings.status, "COMPLETED"),
        gte(bookings.startTime, startOfWeek),
      ),
    );

  const [newClientsResult] = await db
    .select({ count: count() })
    .from(clients)
    .where(and(eq(clients.organizationId, orgId), gte(clients.createdAt, startOfWeek)));

  const withHours = await attachWorkingHours(todayRows);

  return {
    bookingsToday: todayRows.length,
    inProgress: inProgressResult?.count ?? 0,
    revenueThisWeek: revenueResult?.total ?? "0",
    newClientsThisWeek: newClientsResult?.count ?? 0,
    todayBookings: withHours.map(({ row, employeeWorkingHours }) =>
      mapBooking(row, { employeeWorkingHours }),
    ),
  };
};

const mapBookingsWithHours = async (rows: Parameters<typeof mapBooking>[0][]) => {
  const withHours = await attachWorkingHours(rows);
  return withHours.map(({ row, employeeWorkingHours }) =>
    mapBooking(row, { employeeWorkingHours }),
  );
};

export const getOrganizationAnalytics = async (
  context: AuthenticatedContext,
  input: z.infer<typeof organizationAnalyticsInputSchema>,
): Promise<z.infer<typeof organizationAnalyticsOutputSchema>> => {
  const org = await getOrgContext(context, input.organizationId);
  const from = new Date(input.from);
  const to = new Date(input.to);

  return collectOrganizationAnalytics({
    organizationId: org.organizationId,
    from,
    to,
  });
};

export const listOrganizationAnalyticsBookings = async (
  context: AuthenticatedContext,
  input: z.infer<typeof organizationAnalyticsBookingsInputSchema>,
): Promise<z.infer<typeof organizationAnalyticsBookingsOutputSchema>> => {
  const org = await getOrgContext(context, input.organizationId);
  const from = new Date(input.from);
  const to = new Date(input.to);
  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 10;
  const whereClause = and(
    eq(bookings.organizationId, org.organizationId),
    gte(bookings.startTime, from),
    lte(bookings.startTime, to),
  );

  const [totalResult, rows] = await Promise.all([
    db.select({ count: count() }).from(bookings).where(whereClause),
    db.query.bookings.findMany({
      where: whereClause,
      with: bookingWith,
      orderBy: (booking, { desc: descOrder }) => [descOrder(booking.startTime)],
      limit: pageSize,
      offset: getOffset(page, pageSize),
    }),
  ]);

  const items = await mapBookingsWithHours(rows);

  return buildPaginatedResult(items, totalResult[0]?.count ?? 0, page, pageSize);
};

export const exportOrganizationAnalyticsPdf = async (
  context: AuthenticatedContext,
  input: z.infer<typeof organizationAnalyticsInputSchema>,
) => {
  const org = await getOrgContext(context, input.organizationId);
  const from = new Date(input.from);
  const to = new Date(input.to);

  const [analytics, organization, reportRows] = await Promise.all([
    getOrganizationAnalytics(context, input),
    getOrganizationById(context, {
      organizationId: input.organizationId,
    }),
    db.query.bookings.findMany({
      where: and(
        eq(bookings.organizationId, org.organizationId),
        gte(bookings.startTime, from),
        lte(bookings.startTime, to),
      ),
      with: reportBookingWith,
      orderBy: (booking, { desc: descOrder }) => [descOrder(booking.startTime)],
    }),
  ]);

  if (!organization) {
    throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
  }

  const pdfBuffer = await buildOrganizationAnalyticsPdf({
    organization: {
      name: organization.name,
      logo: organization.logo,
      address: organization.address,
      phone: organization.phone,
      email: organization.email,
      website: organization.website,
    },
    analytics,
    reportBookings: reportRows.map(mapReportBooking),
  });

  return {
    pdfBase64: pdfBuffer.toString("base64"),
    filename: buildAnalyticsReportFilename({
      organizationName: organization.name,
      from,
      to,
    }),
    contentType: "application/pdf" as const,
  };
};
