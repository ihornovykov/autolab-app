import { db } from "@autolab/db";
import { users } from "@autolab/db/schema/auth";
import { bookingServices, bookings } from "@autolab/db/schema/booking";
import { clients } from "@autolab/db/schema/client";
import { employees } from "@autolab/db/schema/employee";
import { organizations } from "@autolab/db/schema/organization";
import { profiles } from "@autolab/db/schema/profile";
import { services } from "@autolab/db/schema/service";
import { vehicles } from "@autolab/db/schema/vehicle";
import { and, desc, eq, inArray, or, sql } from "drizzle-orm";

import type { AuthenticatedContext } from "../../context";
import { getOrgContext } from "../../lib/scope";
import { normalizeSearch, searchPattern } from "../../lib/pagination";
import { ilikeHomoglyph, orHomoglyphs } from "../../lib/normalize";
import { buildVehicleSearchCondition } from "../../lib/vehicle";

import type { z } from "zod";

import type { GlobalSearchResult, globalSearchInputSchema } from "./validation";
import {
  MATCH_LIMIT,
  RELATED_LIMIT,
  addResult,
  formatBookingMeta,
  vehicleExistsMatch,
  vehicleSearchColumns,
  type SearchCollector,
} from "./utils";

const searchOrganizations = async (
  userId: string,
  pattern: string,
  collector: SearchCollector,
) => {
  const rows = await db
    .select({ organization: organizations })
    .from(employees)
    .innerJoin(organizations, eq(employees.organizationId, organizations.id))
    .where(
      and(
        eq(employees.userId, userId),
        orHomoglyphs(pattern, organizations.name, organizations.address)!,
      ),
    )
    .limit(MATCH_LIMIT);

  for (const row of rows) {
    addResult(collector, {
      id: row.organization.id,
      type: "organization",
      title: row.organization.name,
      subtitle: row.organization.address ?? undefined,
      relation: "match",
      groupKey: `organization:${row.organization.id}`,
    });
  }
};

const searchEmployees = async (
  organizationId: string,
  pattern: string,
  collector: SearchCollector,
) => {
  const rows = await db
    .select({ employee: employees, user: users })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(
      and(
        eq(employees.organizationId, organizationId),
        orHomoglyphs(pattern, users.name, users.email)!,
      ),
    )
    .limit(MATCH_LIMIT);

  for (const row of rows) {
    addResult(collector, {
      id: row.employee.id,
      type: "employee",
      title: row.user.name,
      subtitle: row.user.email,
      meta: row.employee.role,
      relation: "match",
      groupKey: `employee:${row.employee.id}`,
    });
  }
};

const searchClients = async (
  organizationId: string,
  pattern: string,
  collector: SearchCollector,
) => {
  const rows = await db
    .select({ client: clients, user: users })
    .from(clients)
    .leftJoin(users, eq(clients.userId, users.id))
    .where(
      and(
        eq(clients.organizationId, organizationId),
        orHomoglyphs(
          pattern,
          clients.firstName,
          clients.lastName,
          clients.middleName,
          clients.phone,
          users.email,
        )!,
      ),
    )
    .limit(MATCH_LIMIT);

  const clientIds: string[] = [];

  for (const row of rows) {
    clientIds.push(row.client.id);
    const name = [row.client.firstName, row.client.lastName].filter(Boolean).join(" ");
    addResult(collector, {
      id: row.client.id,
      type: "client",
      title: name,
      subtitle: row.client.phone ?? row.user?.email ?? undefined,
      relation: "match",
      groupKey: `client:${row.client.id}`,
    });
  }

  if (clientIds.length === 0) return;

  const clientVehicles = await db.query.vehicles.findMany({
    where: inArray(vehicles.clientId, clientIds),
    limit: clientIds.length * RELATED_LIMIT,
  });

  for (const clientId of clientIds) {
    const groupKey = `client:${clientId}`;
    const related = clientVehicles
      .filter((vehicle) => vehicle.clientId === clientId)
      .slice(0, RELATED_LIMIT);

    for (const vehicle of related) {
      addResult(collector, {
        id: vehicle.id,
        type: "vehicle",
        title: `${vehicle.make} ${vehicle.model}`,
        meta: String(vehicle.year),
        vehicleMake: vehicle.make,
        licensePlate: vehicle.licensePlate ?? undefined,
        relation: "related",
        groupKey,
      });
    }
  }
};

const searchServices = async (
  organizationId: string,
  pattern: string,
  collector: SearchCollector,
) => {
  const rows = await db.query.services.findMany({
    where: and(
      eq(services.organizationId, organizationId),
      orHomoglyphs(pattern, services.title, services.description),
    ),
    limit: MATCH_LIMIT,
  });

  if (rows.length === 0) return;

  const serviceIds = rows.map((service) => service.id);
  const relatedLinks = await db
    .select({
      bookingId: bookingServices.bookingId,
      serviceId: bookingServices.serviceId,
    })
    .from(bookingServices)
    .where(inArray(bookingServices.serviceId, serviceIds));

  const relatedBookingIds = [...new Set(relatedLinks.map((link) => link.bookingId))];
  const relatedBookings =
    relatedBookingIds.length > 0
      ? await db.query.bookings.findMany({
          where: and(
            eq(bookings.organizationId, organizationId),
            inArray(bookings.id, relatedBookingIds),
          ),
          with: {
            vehicle: {
              columns: { id: true, make: true, model: true, year: true, licensePlate: true },
            },
            bookingServices: { columns: { serviceId: true } },
          },
          orderBy: (booking, { desc: descOrder }) => [descOrder(booking.startTime)],
          limit: serviceIds.length * RELATED_LIMIT,
        })
      : [];

  for (const service of rows) {
    const groupKey = `service:${service.id}`;
    addResult(collector, {
      id: service.id,
      type: "service",
      title: service.title,
      subtitle: service.description ?? undefined,
      meta: `${service.price} грн · ${service.duration} хв`,
      relation: "match",
      groupKey,
    });

    const bookingsForService = relatedBookings
      .filter((booking) =>
        booking.bookingServices?.some((item) => item.serviceId === service.id),
      )
      .slice(0, RELATED_LIMIT);

    for (const booking of bookingsForService) {
      const vehicle = booking.vehicle;
      addResult(collector, {
        id: booking.id,
        type: "booking",
        title: vehicle ? `${vehicle.make} ${vehicle.model}` : "Запис",
        subtitle: service.title,
        meta: formatBookingMeta(booking.startTime, booking.totalPrice),
        vehicleMake: vehicle?.make,
        relation: "related",
        groupKey,
      });

      if (vehicle) {
        addResult(collector, {
          id: vehicle.id,
          type: "vehicle",
          title: `${vehicle.make} ${vehicle.model}`,
          meta: String(vehicle.year),
          vehicleMake: vehicle.make,
          licensePlate: vehicle.licensePlate ?? undefined,
          relation: "related",
          groupKey,
        });
      }
    }
  }
};

const searchVehicles = async (
  organizationId: string,
  rawSearch: string,
  pattern: string,
  collector: SearchCollector,
) => {
  const vehicleMatch = buildVehicleSearchCondition(vehicleSearchColumns, rawSearch);
  if (!vehicleMatch) return;

  const orgClients = await db.query.clients.findMany({
    where: eq(clients.organizationId, organizationId),
    columns: { id: true },
  });
  const clientIds = orgClients.map((client) => client.id);
  if (clientIds.length === 0) return;

  const rows = await db
    .select({ vehicle: vehicles, client: clients })
    .from(vehicles)
    .leftJoin(clients, eq(vehicles.clientId, clients.id))
    .where(
      and(
        inArray(vehicles.clientId, clientIds),
        or(
          vehicleMatch,
          orHomoglyphs(pattern, clients.firstName, clients.lastName),
        )!,
      ),
    )
    .limit(MATCH_LIMIT);

  const vehicleIds = rows.map((row) => row.vehicle.id);
  const relatedBookings =
    vehicleIds.length > 0
      ? await db.query.bookings.findMany({
          where: and(
            eq(bookings.organizationId, organizationId),
            inArray(bookings.vehicleId, vehicleIds),
          ),
          with: {
            bookingServices: { with: { service: { columns: { title: true } } } },
          },
          orderBy: (booking, { desc: descOrder }) => [descOrder(booking.startTime)],
          limit: vehicleIds.length * RELATED_LIMIT,
        })
      : [];

  for (const row of rows) {
    const groupKey = `vehicle:${row.vehicle.id}`;
    const clientName = row.client
      ? [row.client.firstName, row.client.lastName].filter(Boolean).join(" ")
      : undefined;

    addResult(collector, {
      id: row.vehicle.id,
      type: "vehicle",
      title: `${row.vehicle.make} ${row.vehicle.model}`,
      subtitle: clientName,
      meta: String(row.vehicle.year),
      vehicleMake: row.vehicle.make,
      licensePlate: row.vehicle.licensePlate ?? undefined,
      relation: "match",
      groupKey,
    });

    const bookingsForVehicle = relatedBookings
      .filter((booking) => booking.vehicleId === row.vehicle.id)
      .slice(0, RELATED_LIMIT);

    for (const booking of bookingsForVehicle) {
      const serviceTitle = booking.bookingServices?.[0]?.service.title;
      addResult(collector, {
        id: booking.id,
        type: "booking",
        title: `${row.vehicle.make} ${row.vehicle.model}`,
        subtitle: serviceTitle,
        meta: formatBookingMeta(booking.startTime, booking.totalPrice),
        vehicleMake: row.vehicle.make,
        relation: "related",
        groupKey,
      });
    }
  }
};

const searchBookings = async (
  organizationId: string,
  rawSearch: string,
  pattern: string,
  collector: SearchCollector,
) => {
  const whereClause = and(
    eq(bookings.organizationId, organizationId),
    or(
      ilikeHomoglyph(bookings.notes, pattern)!,
      vehicleExistsMatch(rawSearch),
      sql`exists (
          select 1 from ${bookingServices}
          inner join ${services} on ${services.id} = ${bookingServices.serviceId}
          where ${bookingServices.bookingId} = ${bookings.id}
          and ${ilikeHomoglyph(services.title, pattern)}
        )`,
      sql`exists (
          select 1 from ${employees}
          inner join ${users} on ${users.id} = ${employees.userId}
          where ${employees.id} = ${bookings.employeeId}
          and ${ilikeHomoglyph(users.name, pattern)}
        )`,
    ),
  );

  const idRows = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(whereClause)
    .orderBy(desc(bookings.startTime))
    .limit(MATCH_LIMIT);

  if (idRows.length === 0) return;

  const rows = await db.query.bookings.findMany({
    where: inArray(
      bookings.id,
      idRows.map((row) => row.id),
    ),
    with: {
      vehicle: { columns: { id: true, make: true, model: true, year: true, licensePlate: true } },
      bookingServices: { with: { service: { columns: { title: true } } } },
    },
  });

  const idOrder = new Map(idRows.map((row, index) => [row.id, index]));
  const orderedRows = [...rows].sort(
    (a, b) => (idOrder.get(a.id) ?? 0) - (idOrder.get(b.id) ?? 0),
  );

  for (const booking of orderedRows) {
    const groupKey = `booking:${booking.id}`;
    const vehicle = booking.vehicle;
    const serviceTitle = booking.bookingServices?.map((item) => item.service.title).join(", ");

    addResult(collector, {
      id: booking.id,
      type: "booking",
      title: vehicle ? `${vehicle.make} ${vehicle.model}` : "Запис",
      subtitle: serviceTitle || undefined,
      meta: formatBookingMeta(booking.startTime, booking.totalPrice),
      vehicleMake: vehicle?.make,
      relation: "match",
      groupKey,
    });

    if (vehicle) {
      addResult(collector, {
        id: vehicle.id,
        type: "vehicle",
        title: `${vehicle.make} ${vehicle.model}`,
        meta: String(vehicle.year),
        vehicleMake: vehicle.make,
        licensePlate: vehicle.licensePlate ?? undefined,
        relation: "related",
        groupKey,
      });
    }
  }
};

export const globalSearch = async (
  context: AuthenticatedContext,
  input: z.infer<typeof globalSearchInputSchema>,
) => {
  const normalized = normalizeSearch(input.query);
  const pattern = searchPattern(normalized);
  if (!pattern) return { items: [] as GlobalSearchResult[] };

  const collector: SearchCollector = {
    items: [],
    seen: new Set(),
    limit: input.limit ?? 30,
  };

  await searchOrganizations(context.session.user.id, pattern, collector);

  if (input.organizationId) {
    await getOrgContext(context, input.organizationId);

    await searchEmployees(input.organizationId, pattern, collector);
    await searchClients(input.organizationId, pattern, collector);
    await searchVehicles(input.organizationId, normalized, pattern, collector);
    await searchBookings(input.organizationId, normalized, pattern, collector);
    await searchServices(input.organizationId, pattern, collector);
  }

  return { items: collector.items };
};
