import { db } from "@autolab/db";
import { users } from "@autolab/db/schema/auth";
import { bookings } from "@autolab/db/schema/booking";
import { clients } from "@autolab/db/schema/client";
import { vehicles } from "@autolab/db/schema/vehicle";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import type { AuthenticatedContext } from "../../context";
import { createId, getOrgContext } from "../../lib/org-scope";
import { buildPaginatedResult, getOffset, searchPattern } from "../../lib/pagination";
import { orHomoglyphs } from "../../lib/search-normalize";

import type { z } from "zod";

import type {
  clientDetailsOutputSchema,
  createClientInputSchema,
  listClientsInputSchema,
  listClientsOutputSchema,
  updateClientInputSchema,
} from "./validation";

const clientBookingWith = {
  vehicle: true as const,
  employee: true as const,
  bookingServices: { with: { service: true as const } },
};

const mapClientBooking = (row: {
  bookingServices?: Array<{
    service: { id: string; title: string; price: string; duration: number };
  }>;
}) => {
  const { bookingServices: bookingServiceRows, ...booking } = row as typeof row & {
    id: string;
    organizationId: string;
    employeeId: string;
    vehicleId: string;
    startTime: Date;
    endTime: Date;
    allowsOvertime: boolean;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    notes: string | null;
    totalPrice: string;
    createdAt: Date;
    updatedAt: Date;
  };

  return {
    ...booking,
    services: bookingServiceRows?.map((item) => item.service),
  };
};

export const listClients = async (
  context: AuthenticatedContext,
  input: z.infer<typeof listClientsInputSchema>,
): Promise<z.infer<typeof listClientsOutputSchema>> => {
  await getOrgContext(context, input.organizationId);

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const pattern = searchPattern(input.search);
  const conditions = [eq(clients.organizationId, input.organizationId)];

  if (pattern) {
    conditions.push(
      orHomoglyphs(
        pattern,
        clients.firstName,
        clients.lastName,
        clients.middleName,
        clients.phone,
        users.email,
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(clients)
    .leftJoin(users, eq(clients.userId, users.id))
    .where(whereClause);

  const total = totalResult?.count ?? 0;
  const offset = getOffset(page, pageSize);

  const rows = await db
    .select({
      id: clients.id,
      organizationId: clients.organizationId,
      userId: clients.userId,
      firstName: clients.firstName,
      lastName: clients.lastName,
      middleName: clients.middleName,
      phone: clients.phone,
      createdAt: clients.createdAt,
      updatedAt: clients.updatedAt,
      email: users.email,
      vehicleCount: sql<number>`coalesce((select count(*)::int from ${vehicles} where ${vehicles.clientId} = ${clients.id}), 0)`,
    })
    .from(clients)
    .leftJoin(users, eq(clients.userId, users.id))
    .where(whereClause)
    .orderBy(desc(clients.createdAt))
    .limit(pageSize)
    .offset(offset);

  return buildPaginatedResult(
    rows.map((row) => ({
      ...row,
      email: row.email ?? null,
    })),
    total,
    page,
    pageSize,
  );
};

export const createClient = async (
  context: AuthenticatedContext,
  input: z.infer<typeof createClientInputSchema>,
) => {
  await getOrgContext(context, input.organizationId);

  const [client] = await db
    .insert(clients)
    .values({
      id: createId(),
      organizationId: input.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      middleName: input.middleName,
      phone: input.phone,
      userId: input.userId,
    })
    .returning();

  if (!client) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create client" });
  }

  return { ...client, vehicleCount: 0 };
};

export const updateClient = async (
  context: AuthenticatedContext,
  input: z.infer<typeof updateClientInputSchema>,
) => {
  await getOrgContext(context, input.organizationId);

  const { clientId, organizationId, ...data } = input;

  const [updated] = await db
    .update(clients)
    .set(data)
    .where(and(eq(clients.id, clientId), eq(clients.organizationId, organizationId)))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Client not found" });
  }

  const [result] = await db
    .select({ count: count() })
    .from(vehicles)
    .where(eq(vehicles.clientId, updated.id));

  return { ...updated, vehicleCount: result?.count ?? 0 };
};

export const deleteClient = async (
  context: AuthenticatedContext,
  input: { organizationId: string; clientId: string },
) => {
  await getOrgContext(context, input.organizationId);

  await db
    .delete(clients)
    .where(and(eq(clients.id, input.clientId), eq(clients.organizationId, input.organizationId)));

  return { success: true as const };
};

export const getClientDetails = async (
  context: AuthenticatedContext,
  input: { organizationId: string; clientId: string },
): Promise<z.infer<typeof clientDetailsOutputSchema>> => {
  await getOrgContext(context, input.organizationId);

  const clientRow = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, input.clientId),
      eq(clients.organizationId, input.organizationId),
    ),
    with: {
      user: {
        columns: {
          email: true,
        },
      },
    },
  });

  if (!clientRow) {
    throw new ORPCError("NOT_FOUND", { message: "Client not found" });
  }

  const { user, ...rest } = clientRow;

  const [vehicleCountResult] = await db
    .select({ count: count() })
    .from(vehicles)
    .where(eq(vehicles.clientId, input.clientId));

  const client = {
    ...rest,
    email: user?.email ?? null,
    vehicleCount: vehicleCountResult?.count ?? 0,
  };

  const clientVehicles = await db.query.vehicles.findMany({
    where: eq(vehicles.clientId, input.clientId),
    orderBy: (vehicle, { desc }) => [desc(vehicle.createdAt)],
  });

  const vehicleIds = clientVehicles.map((vehicle) => vehicle.id);

  const bookingRows =
    vehicleIds.length > 0
      ? await db.query.bookings.findMany({
          where: and(
            eq(bookings.organizationId, input.organizationId),
            inArray(bookings.vehicleId, vehicleIds),
          ),
          with: clientBookingWith,
          orderBy: (booking, { desc }) => [desc(booking.startTime)],
        })
      : [];

  return {
    client,
    vehicles: clientVehicles,
    bookings: bookingRows.map(mapClientBooking),
  };
};
