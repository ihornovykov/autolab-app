import { db } from "@autolab/db";
import { users } from "@autolab/db/schema/auth";
import { bookings } from "@autolab/db/schema/booking";
import { clients } from "@autolab/db/schema/client";
import { employees } from "@autolab/db/schema/employee";
import { organizations } from "@autolab/db/schema/organization";
import { organizationWorkingHours } from "@autolab/db/schema/organization-working-hours";
import { services } from "@autolab/db/schema/service";
import { vehicleMakes, vehicleModels, vehicles } from "@autolab/db/schema/vehicle";
import { ORPCError } from "@orpc/server";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

import { buildPaginatedResult, getOffset, searchPattern } from "../../lib/pagination";
import { createId } from "../../lib/scope";

import type { z } from "zod";

import type {
  listBookingsInputSchema,
  listModelsInputSchema,
  listOrganizationsInputSchema,
  listUsersInputSchema,
  modelInputSchema,
  overviewInputSchema,
  setBookingStatusInputSchema,
  updateMakeInputSchema,
  updateModelInputSchema,
  updateOrganizationInputSchema,
} from "./validation";

const toSqlTime = (value: string | null) => {
  if (!value) return null;
  return value.length === 5 ? `${value}:00` : value;
};

const rangeStart = (value?: string) => {
  if (value) return new Date(value);
  const date = new Date();
  date.setUTCDate(date.getUTCDate() - 7);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

const rangeEnd = (value?: string) => {
  if (value) return new Date(value);
  const date = new Date();
  date.setUTCHours(23, 59, 59, 999);
  return date;
};

const countWhere = async (table: PgTable, where?: SQL) => {
  const query = db.select({ value: count() }).from(table);
  const [row] = where ? await query.where(where) : await query;
  return row?.value ?? 0;
};

export const getOverview = async (input: z.infer<typeof overviewInputSchema>) => {
  const from = rangeStart(input.from);
  const to = rangeEnd(input.to);

  const [orgTotal, orgCreated, userTotal, userCreated, admins] = await Promise.all([
    countWhere(organizations),
    countWhere(organizations, and(gte(organizations.createdAt, from), lte(organizations.createdAt, to))),
    countWhere(users),
    countWhere(users, and(gte(users.createdAt, from), lte(users.createdAt, to))),
    countWhere(users, eq(users.role, "admin")),
  ]);

  const statusRows = await db
    .select({ status: bookings.status, value: count() })
    .from(bookings)
    .where(and(gte(bookings.startTime, from), lte(bookings.startTime, to)))
    .groupBy(bookings.status);

  const byStatus = { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 };
  for (const row of statusRows) byStatus[row.status] = row.value;

  const [revenue] = await db
    .select({ value: sql<string>`coalesce(sum(${bookings.totalPrice}), 0)` })
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "COMPLETED"),
        gte(bookings.startTime, from),
        lte(bookings.startTime, to),
      ),
    );

  return {
    organizations: {
      total: orgTotal,
      createdInRange: orgCreated,
    },
    users: {
      total: userTotal,
      createdInRange: userCreated,
      platformAdmins: admins,
    },
    bookings: {
      totalInRange: Object.values(byStatus).reduce((sum, value) => sum + value, 0),
      byStatus,
      completedRevenueInRange: String(revenue?.value ?? "0"),
    },
  };
};

export const listOrganizations = async (input: z.infer<typeof listOrganizationsInputSchema>) => {
  const pattern = searchPattern(input.search);
  const filters = [
    pattern
      ? or(
          ilike(organizations.name, pattern),
          ilike(organizations.slug, pattern),
          ilike(organizations.email, pattern),
          ilike(organizations.phone, pattern),
        )
      : undefined,
  ].filter(Boolean) as SQL[];
  const where = filters.length > 0 ? and(...filters) : undefined;
  const order =
    input.sort === "name"
      ? input.direction === "asc"
        ? asc(organizations.name)
        : desc(organizations.name)
      : input.direction === "asc"
        ? asc(organizations.createdAt)
        : desc(organizations.createdAt);

  const [total, rows] = await Promise.all([
    countWhere(organizations, where),
    db
      .select()
      .from(organizations)
      .where(where)
      .orderBy(order)
      .limit(input.pageSize)
      .offset(getOffset(input.page, input.pageSize)),
  ]);

  const ids = rows.map((row) => row.id);
  const employeeCounts = ids.length
    ? await db
        .select({ id: employees.organizationId, value: count() })
        .from(employees)
        .where(inArray(employees.organizationId, ids))
        .groupBy(employees.organizationId)
    : [];
  const bookingCounts = ids.length
    ? await db
        .select({ id: bookings.organizationId, value: count() })
        .from(bookings)
        .where(inArray(bookings.organizationId, ids))
        .groupBy(bookings.organizationId)
    : [];

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    email: row.email,
    phone: row.phone,
    address: row.address,
    employeeCount: employeeCounts.find((entry) => entry.id === row.id)?.value ?? 0,
    bookingCount: bookingCounts.find((entry) => entry.id === row.id)?.value ?? 0,
    createdAt: row.createdAt.toISOString(),
  }));

  return buildPaginatedResult(items, total, input.page, input.pageSize);
};

export const getOrganization = async (id: string) => {
  const organization = await db.query.organizations.findFirst({
    where: eq(organizations.id, id),
  });
  if (!organization) throw new ORPCError("NOT_FOUND", { message: "Organization not found" });

  const [hours, employeeCount, clientCount, serviceCount, vehicleCount, bookingCount, recent] =
    await Promise.all([
      db
        .select()
        .from(organizationWorkingHours)
        .where(eq(organizationWorkingHours.organizationId, id)),
      countWhere(employees, eq(employees.organizationId, id)),
      countWhere(clients, eq(clients.organizationId, id)),
      countWhere(services, eq(services.organizationId, id)),
      db
        .select({ value: count() })
        .from(vehicles)
        .innerJoin(clients, eq(vehicles.clientId, clients.id))
        .where(eq(clients.organizationId, id))
        .then((rows) => rows[0]?.value ?? 0),
      countWhere(bookings, eq(bookings.organizationId, id)),
      db.query.bookings.findMany({
        where: eq(bookings.organizationId, id),
        orderBy: desc(bookings.startTime),
        limit: 5,
        with: { vehicle: true },
      }),
    ]);

  return {
    ...organization,
    createdAt: organization.createdAt.toISOString(),
    updatedAt: organization.updatedAt.toISOString(),
    workingHours: hours.map((hour) => ({
      weekday: hour.weekday,
      openTime: hour.openTime,
      closeTime: hour.closeTime,
      isClosed: hour.isClosed,
    })),
    counts: {
      employees: employeeCount,
      clients: clientCount,
      services: serviceCount,
      vehicles: vehicleCount,
      bookings: bookingCount,
    },
    recentBookings: recent.map((booking) => ({
      id: booking.id,
      status: booking.status,
      startTime: booking.startTime.toISOString(),
      totalPrice: booking.totalPrice,
      vehicle: booking.vehicle
        ? `${booking.vehicle.make} ${booking.vehicle.model}`
        : null,
    })),
  };
};

export const updateOrganization = async (
  input: z.infer<typeof updateOrganizationInputSchema>,
) => {
  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.slug, input.slug),
  });
  if (existing && existing.id !== input.id) {
    throw new ORPCError("CONFLICT", { message: "Slug is already in use" });
  }

  if (input.workingHours) {
    const weekdays = new Set(input.workingHours.map((day) => day.weekday));
    if (weekdays.size !== 7) {
      throw new ORPCError("BAD_REQUEST", { message: "Потрібен графік на всі сім днів" });
    }
    for (const day of input.workingHours) {
      if (!day.isClosed && (!day.openTime || !day.closeTime || day.closeTime <= day.openTime)) {
        throw new ORPCError("BAD_REQUEST", {
          message: "Для робочого дня вкажіть години відкриття і закриття",
        });
      }
    }
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(organizations)
      .set({
        name: input.name,
        slug: input.slug,
        logo: input.logo,
        description: input.description,
        address: input.address,
        phone: input.phone,
        email: input.email,
        website: input.website,
        latitude: input.latitude,
        longitude: input.longitude,
      })
      .where(eq(organizations.id, input.id))
      .returning();

    if (!row || !input.workingHours) return row ?? null;

    for (const day of input.workingHours) {
      await tx
        .insert(organizationWorkingHours)
        .values({
          id: createId(),
          organizationId: input.id,
          weekday: day.weekday,
          openTime: toSqlTime(day.isClosed ? null : day.openTime),
          closeTime: toSqlTime(day.isClosed ? null : day.closeTime),
          isClosed: day.isClosed,
        })
        .onConflictDoUpdate({
          target: [organizationWorkingHours.organizationId, organizationWorkingHours.weekday],
          set: {
            openTime: toSqlTime(day.isClosed ? null : day.openTime),
            closeTime: toSqlTime(day.isClosed ? null : day.closeTime),
            isClosed: day.isClosed,
          },
        });
    }

    return row;
  });

  if (!updated) throw new ORPCError("NOT_FOUND", { message: "Organization not found" });

  return updated;
};

const isAdminRole = (role: string | null | undefined) =>
  (role ?? "")
    .split(",")
    .map((value) => value.trim())
    .includes("admin");

export const listUsers = async (input: z.infer<typeof listUsersInputSchema>) => {
  const pattern = searchPattern(input.search);
  const filters = [
    input.platformAdmin === undefined
      ? undefined
      : input.platformAdmin
        ? eq(users.role, "admin")
        : sql`${users.role} <> 'admin'`,
    pattern ? or(ilike(users.name, pattern), ilike(users.email, pattern)) : undefined,
  ].filter(Boolean) as SQL[];
  const where = filters.length > 0 ? and(...filters) : undefined;
  const order =
    input.sort === "email"
      ? input.direction === "asc"
        ? asc(users.email)
        : desc(users.email)
      : input.direction === "asc"
        ? asc(users.createdAt)
        : desc(users.createdAt);

  const [total, rows] = await Promise.all([
    countWhere(users, where),
    db
      .select()
      .from(users)
      .where(where)
      .orderBy(order)
      .limit(input.pageSize)
      .offset(getOffset(input.page, input.pageSize)),
  ]);

  const ids = rows.map((row) => row.id);
  const memberships = ids.length
    ? await db
        .select({ id: employees.userId, value: count() })
        .from(employees)
        .where(inArray(employees.userId, ids))
        .groupBy(employees.userId)
    : [];

  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    emailVerified: row.emailVerified,
    isPlatformAdmin: isAdminRole(row.role),
    employeeMembershipCount: memberships.find((entry) => entry.id === row.id)?.value ?? 0,
    createdAt: row.createdAt.toISOString(),
  }));

  return buildPaginatedResult(items, total, input.page, input.pageSize);
};

export const getUser = async (id: string) => {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    with: { profile: true, employees: { with: { organization: true } }, clients: { with: { organization: true } }, sessions: true },
  });
  if (!user) throw new ORPCError("NOT_FOUND", { message: "User not found" });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: user.emailVerified,
    image: user.image,
    role: user.role,
    createdAt: user.createdAt.toISOString(),
    profile: user.profile
      ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          middleName: user.profile.middleName,
          phone: user.profile.phone,
        }
      : null,
    memberships: user.employees.map((employee) => ({
      employeeId: employee.id,
      organizationId: employee.organizationId,
      organizationName: employee.organization.name,
      role: employee.role,
      isActive: employee.isActive,
    })),
    clientRecords: user.clients.map((client) => ({
      clientId: client.id,
      organizationId: client.organizationId,
      organizationName: client.organization.name,
      phone: client.phone,
    })),
    sessions: user.sessions.map((session) => ({
      id: session.id,
      createdAt: session.createdAt.toISOString(),
      expiresAt: session.expiresAt.toISOString(),
      ipAddress: session.ipAddress,
      userAgent: session.userAgent,
      impersonatedBy: session.impersonatedBy,
    })),
  };
};

export const listBookings = async (input: z.infer<typeof listBookingsInputSchema>) => {
  const pattern = searchPattern(input.search);
  const filters = [
    input.organizationId ? eq(bookings.organizationId, input.organizationId) : undefined,
    input.status ? eq(bookings.status, input.status) : undefined,
    input.from ? gte(bookings.startTime, new Date(input.from)) : undefined,
    input.to ? lte(bookings.startTime, new Date(input.to)) : undefined,
    pattern
      ? or(ilike(bookings.id, pattern), ilike(organizations.name, pattern), ilike(vehicles.licensePlate, pattern))
      : undefined,
  ].filter(Boolean) as SQL[];
  const where = filters.length > 0 ? and(...filters) : undefined;

  const base = db
    .select({
      id: bookings.id,
      status: bookings.status,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      totalPrice: bookings.totalPrice,
      organizationId: organizations.id,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      vehicleId: vehicles.id,
      make: vehicles.make,
      model: vehicles.model,
      licensePlate: vehicles.licensePlate,
      employeeName: users.name,
    })
    .from(bookings)
    .innerJoin(organizations, eq(bookings.organizationId, organizations.id))
    .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .innerJoin(employees, eq(bookings.employeeId, employees.id))
    .innerJoin(users, eq(employees.userId, users.id))
    .where(where);

  const [totalRow] = await db
    .select({ value: count() })
    .from(bookings)
    .innerJoin(organizations, eq(bookings.organizationId, organizations.id))
    .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .where(where);

  const rows = await base
    .orderBy(desc(bookings.startTime))
    .limit(input.pageSize)
    .offset(getOffset(input.page, input.pageSize));

  const items = rows.map((row) => ({
    id: row.id,
    status: row.status,
    startTime: row.startTime.toISOString(),
    endTime: row.endTime.toISOString(),
    totalPrice: row.totalPrice,
    organization: { id: row.organizationId, name: row.organizationName, slug: row.organizationSlug },
    vehicle: {
      id: row.vehicleId,
      make: row.make,
      model: row.model,
      licensePlate: row.licensePlate,
    },
    employeeName: row.employeeName,
  }));

  return buildPaginatedResult(items, totalRow?.value ?? 0, input.page, input.pageSize);
};

export const getBooking = async (id: string) => {
  const booking = await db.query.bookings.findFirst({
    where: eq(bookings.id, id),
    with: {
      organization: true,
      vehicle: { with: { client: true } },
      employee: { with: { user: true } },
      bookingServices: { with: { service: true } },
    },
  });
  if (!booking) throw new ORPCError("NOT_FOUND", { message: "Booking not found" });

  return {
    id: booking.id,
    status: booking.status,
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    totalPrice: booking.totalPrice,
    notes: booking.notes,
    allowsOvertime: booking.allowsOvertime,
    createdAt: booking.createdAt.toISOString(),
    updatedAt: booking.updatedAt.toISOString(),
    organization: {
      id: booking.organization.id,
      name: booking.organization.name,
      slug: booking.organization.slug,
    },
    vehicle: {
      id: booking.vehicle.id,
      make: booking.vehicle.make,
      model: booking.vehicle.model,
      licensePlate: booking.vehicle.licensePlate,
    },
    client: booking.vehicle.client
      ? {
          name: [booking.vehicle.client.firstName, booking.vehicle.client.lastName].filter(Boolean).join(" "),
          phone: booking.vehicle.client.phone,
        }
      : null,
    employeeId: booking.employee.id,
    employeeName: booking.employee.user.name,
    employeeRole: booking.employee.role,
    services: booking.bookingServices.map((line) => ({
      serviceId: line.serviceId,
      title: line.service.title,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      duration: line.duration,
    })),
  };
};

export const setBookingStatus = async (
  input: z.infer<typeof setBookingStatusInputSchema>,
) => {
  const current = await db.query.bookings.findFirst({ where: eq(bookings.id, input.id) });
  if (!current) throw new ORPCError("NOT_FOUND", { message: "Booking not found" });

  const [updated] = await db
    .update(bookings)
    .set({ status: input.status })
    .where(eq(bookings.id, input.id))
    .returning();
  if (!updated) throw new ORPCError("NOT_FOUND", { message: "Booking not found" });

  return { id: updated.id, status: updated.status };
};

const scope = (input: { organizationId: string; search?: string; page: number; pageSize: number }) => input;

export const listOrganizationEmployees = async (
  input: ReturnType<typeof scope>,
) => {
  const pattern = searchPattern(input.search);
  const where = and(
    eq(employees.organizationId, input.organizationId),
    pattern ? or(ilike(users.name, pattern), ilike(users.email, pattern)) : undefined,
  );
  const joined = db
    .select({
      id: employees.id,
      userId: users.id,
      name: users.name,
      email: users.email,
      role: employees.role,
      isActive: employees.isActive,
    })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .where(where);
  const [totalRow] = await db
    .select({ value: count() })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .where(where);
  const rows = await joined.orderBy(asc(users.name)).limit(input.pageSize).offset(getOffset(input.page, input.pageSize));
  return buildPaginatedResult(rows, totalRow?.value ?? 0, input.page, input.pageSize);
};

export const listOrganizationClients = async (input: ReturnType<typeof scope>) => {
  const pattern = searchPattern(input.search);
  const where = and(
    eq(clients.organizationId, input.organizationId),
    pattern
      ? or(
          ilike(clients.firstName, pattern),
          ilike(clients.lastName, pattern),
          ilike(clients.phone, pattern),
        )
      : undefined,
  );
  const [totalRow] = await db.select({ value: count() }).from(clients).where(where);
  const rows = await db
    .select({
      id: clients.id,
      firstName: clients.firstName,
      lastName: clients.lastName,
      middleName: clients.middleName,
      phone: clients.phone,
    })
    .from(clients)
    .where(where)
    .orderBy(asc(clients.firstName))
    .limit(input.pageSize)
    .offset(getOffset(input.page, input.pageSize));
  return buildPaginatedResult(
    rows.map((row) => ({
      id: row.id,
      name: [row.firstName, row.lastName].filter(Boolean).join(" "),
      firstName: row.firstName,
      lastName: row.lastName,
      middleName: row.middleName,
      phone: row.phone,
    })),
    totalRow?.value ?? 0,
    input.page,
    input.pageSize,
  );
};

export const listOrganizationVehicles = async (input: ReturnType<typeof scope>) => {
  const pattern = searchPattern(input.search);
  const where = and(
    eq(clients.organizationId, input.organizationId),
    pattern
      ? or(ilike(vehicles.make, pattern), ilike(vehicles.model, pattern), ilike(vehicles.licensePlate, pattern))
      : undefined,
  );
  const [totalRow] = await db
    .select({ value: count() })
    .from(vehicles)
    .innerJoin(clients, eq(vehicles.clientId, clients.id))
    .where(where);
  const rows = await db
    .select({
      id: vehicles.id,
      make: vehicles.make,
      model: vehicles.model,
      year: vehicles.year,
      licensePlate: vehicles.licensePlate,
      clientId: clients.id,
      clientName: clients.firstName,
      clientLastName: clients.lastName,
      type: vehicles.type,
      vin: vehicles.vin,
      engine: vehicles.engine,
      engineVolume: vehicles.engineVolume,
      bodyStyle: vehicles.bodyStyle,
      notes: vehicles.notes,
    })
    .from(vehicles)
    .innerJoin(clients, eq(vehicles.clientId, clients.id))
    .where(where)
    .orderBy(asc(vehicles.make), asc(vehicles.model))
    .limit(input.pageSize)
    .offset(getOffset(input.page, input.pageSize));
  return buildPaginatedResult(
    rows.map((row) => ({
      id: row.id,
      name: `${row.make} ${row.model}`,
      make: row.make,
      model: row.model,
      year: row.year,
      licensePlate: row.licensePlate,
      clientId: row.clientId,
      clientName: [row.clientName, row.clientLastName].filter(Boolean).join(" "),
      type: row.type,
      vin: row.vin,
      engine: row.engine,
      engineVolume: row.engineVolume,
      bodyStyle: row.bodyStyle,
      notes: row.notes,
    })),
    totalRow?.value ?? 0,
    input.page,
    input.pageSize,
  );
};

export const listOrganizationServices = async (input: ReturnType<typeof scope>) => {
  const pattern = searchPattern(input.search);
  const where = and(
    eq(services.organizationId, input.organizationId),
    pattern ? or(ilike(services.title, pattern), ilike(services.category, pattern)) : undefined,
  );
  const [totalRow] = await db.select({ value: count() }).from(services).where(where);
  const rows = await db
    .select({
      id: services.id,
      title: services.title,
      category: services.category,
      description: services.description,
      price: services.price,
      duration: services.duration,
    })
    .from(services)
    .where(where)
    .orderBy(asc(services.title))
    .limit(input.pageSize)
    .offset(getOffset(input.page, input.pageSize));
  return buildPaginatedResult(rows, totalRow?.value ?? 0, input.page, input.pageSize);
};

export const listVehicleMakes = async (page: number, pageSize: number, search?: string) => {
  const pattern = searchPattern(search);
  const where = pattern ? ilike(vehicleMakes.name, pattern) : undefined;
  const [total, rows] = await Promise.all([
    countWhere(vehicleMakes, where),
    db
      .select()
      .from(vehicleMakes)
      .where(where)
      .orderBy(asc(vehicleMakes.name))
      .limit(pageSize)
      .offset(getOffset(page, pageSize)),
  ]);
  const ids = rows.map((row) => row.id);
  const modelCounts = ids.length
    ? await db
        .select({ id: vehicleModels.makeId, value: count() })
        .from(vehicleModels)
        .where(inArray(vehicleModels.makeId, ids))
        .groupBy(vehicleModels.makeId)
    : [];
  const items = rows.map((row) => ({
    id: row.id,
    name: row.name,
    modelCount: modelCounts.find((entry) => entry.id === row.id)?.value ?? 0,
  }));
  return buildPaginatedResult(items, total, page, pageSize);
};

export const createVehicleMake = async (name: string) => {
  const id = createId();
  try {
    const [created] = await db.insert(vehicleMakes).values({ id, name }).returning();
    if (!created) throw new ORPCError("INTERNAL_SERVER_ERROR");
    return created;
  } catch (error) {
    if (error instanceof ORPCError) throw error;
    throw new ORPCError("CONFLICT", { message: "Make already exists" });
  }
};

export const updateVehicleMake = async (
  input: z.infer<typeof updateMakeInputSchema>,
) => {
  const [updated] = await db
    .update(vehicleMakes)
    .set({ name: input.name })
    .where(eq(vehicleMakes.id, input.id))
    .returning();
  if (!updated) throw new ORPCError("NOT_FOUND", { message: "Make not found" });
  return updated;
};

export const deleteVehicleMake = async (id: string) => {
  const [deleted] = await db.delete(vehicleMakes).where(eq(vehicleMakes.id, id)).returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Make not found" });
  return { id: deleted.id };
};

export const listVehicleModels = async (input: z.infer<typeof listModelsInputSchema>) => {
  const pattern = searchPattern(input.search);
  const where = and(
    eq(vehicleModels.makeId, input.makeId),
    pattern ? ilike(vehicleModels.name, pattern) : undefined,
  );
  const [total, rows] = await Promise.all([
    countWhere(vehicleModels, where),
    db
      .select()
      .from(vehicleModels)
      .where(where)
      .orderBy(asc(vehicleModels.name))
      .limit(input.pageSize)
      .offset(getOffset(input.page, input.pageSize)),
  ]);
  return buildPaginatedResult(rows, total, input.page, input.pageSize);
};

export const createVehicleModel = async (
  input: z.infer<typeof modelInputSchema>,
) => {
  if (input.yearFrom != null && input.yearTo != null && input.yearTo < input.yearFrom) {
    throw new ORPCError("BAD_REQUEST", { message: "yearTo must be greater than or equal to yearFrom" });
  }
  const make = await db.query.vehicleMakes.findFirst({ where: eq(vehicleMakes.id, input.makeId) });
  if (!make) throw new ORPCError("NOT_FOUND", { message: "Make not found" });
  const id = createId();
  try {
    const [created] = await db
      .insert(vehicleModels)
      .values({
        id,
        makeId: input.makeId,
        name: input.name,
        yearFrom: input.yearFrom,
        yearTo: input.yearTo,
      })
      .returning();
    if (!created) throw new ORPCError("INTERNAL_SERVER_ERROR");
    return created;
  } catch (error) {
    if (error instanceof ORPCError) throw error;
    throw new ORPCError("CONFLICT", { message: "Model already exists" });
  }
};

export const updateVehicleModel = async (
  input: z.infer<typeof updateModelInputSchema>,
) => {
  if (input.yearFrom != null && input.yearTo != null && input.yearTo < input.yearFrom) {
    throw new ORPCError("BAD_REQUEST", { message: "yearTo must be greater than or equal to yearFrom" });
  }
  const [updated] = await db
    .update(vehicleModels)
    .set({ name: input.name, yearFrom: input.yearFrom, yearTo: input.yearTo })
    .where(eq(vehicleModels.id, input.id))
    .returning();
  if (!updated) throw new ORPCError("NOT_FOUND", { message: "Model not found" });
  return updated;
};

export const deleteVehicleModel = async (id: string) => {
  const [deleted] = await db.delete(vehicleModels).where(eq(vehicleModels.id, id)).returning();
  if (!deleted) throw new ORPCError("NOT_FOUND", { message: "Model not found" });
  return { id: deleted.id };
};
