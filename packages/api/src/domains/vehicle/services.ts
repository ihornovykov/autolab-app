import { db } from "@autolab/db";
import { clients } from "@autolab/db/schema/client";
import { vehicles } from "@autolab/db/schema/vehicle";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";

import { resolveModels } from "./utils";

import type { AuthenticatedContext, Context } from "../../context";
import { createId, getOrgContext } from "../../lib/scope";
import { buildPaginatedResult, getOffset, searchPattern } from "../../lib/pagination";
import { orHomoglyphs } from "../../lib/normalize";
import { buildVehicleSearchCondition } from "../../lib/vehicle";

import type { z } from "zod";

import type {
  createUserVehicleInputSchema,
  createVehicleInputSchema,
  deleteUserVehicleInputSchema,
  getModelsInputSchema,
  getModelsOutputSchema,
  getVehicleInputSchema,
  listUserVehiclesOutputSchema,
  listVehiclesInputSchema,
  listVehiclesOutputSchema,
  updateVehicleInputSchema,
  updateUserVehicleInputSchema,
} from "./validation";

const getOrgClientIds = async (organizationId: string) => {
  const orgClients = await db.query.clients.findMany({
    where: eq(clients.organizationId, organizationId),
    columns: { id: true },
  });
  return orgClients.map((c) => c.id);
};

export const listVehicles = async (
  context: AuthenticatedContext,
  input: z.infer<typeof listVehiclesInputSchema>,
): Promise<z.infer<typeof listVehiclesOutputSchema>> => {
  await getOrgContext(context, input.organizationId);
  const clientIds = await getOrgClientIds(input.organizationId);

  if (clientIds.length === 0) {
    return buildPaginatedResult([], 0, input.page ?? 1, input.pageSize ?? 25);
  }

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const pattern = searchPattern(input.search);
  const offset = getOffset(page, pageSize);

  const conditions = [
    input.clientId
      ? and(eq(vehicles.clientId, input.clientId), inArray(vehicles.clientId, clientIds))
      : inArray(vehicles.clientId, clientIds),
  ];

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
        vehicleMatch,
        orHomoglyphs(pattern, vehicles.bodyStyle, clients.firstName, clients.lastName),
      )!,
    );
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(vehicles)
    .leftJoin(clients, eq(vehicles.clientId, clients.id))
    .where(whereClause);

  const total = totalResult?.count ?? 0;

  const idRows = await db
    .select({ id: vehicles.id })
    .from(vehicles)
    .leftJoin(clients, eq(vehicles.clientId, clients.id))
    .where(whereClause)
    .orderBy(desc(vehicles.createdAt))
    .limit(pageSize)
    .offset(offset);

  if (idRows.length === 0) {
    return buildPaginatedResult([], total, page, pageSize);
  }

  const rows = await db.query.vehicles.findMany({
    where: inArray(
      vehicles.id,
      idRows.map((row) => row.id),
    ),
    with: { client: true },
    orderBy: (vehicle, { desc: descOrder }) => [descOrder(vehicle.createdAt)],
  });

  return buildPaginatedResult(rows, total, page, pageSize);
};

export const getVehicleById = async (
  context: AuthenticatedContext,
  input: z.infer<typeof getVehicleInputSchema>,
) => {
  await getOrgContext(context, input.organizationId);
  const clientIds = await getOrgClientIds(input.organizationId);

  return (
    (await db.query.vehicles.findFirst({
      where: and(eq(vehicles.id, input.vehicleId), inArray(vehicles.clientId, clientIds)),
      with: { client: true },
    })) ?? null
  );
};

export const createVehicle = async (
  context: AuthenticatedContext,
  input: z.infer<typeof createVehicleInputSchema>,
) => {
  await getOrgContext(context, input.organizationId);
  if (input.clientId) {
    const client = await db.query.clients.findFirst({
      where: and(eq(clients.id, input.clientId), eq(clients.organizationId, input.organizationId)),
    });
    if (!client) {
      throw new ORPCError("BAD_REQUEST", { message: "Client not found in organization" });
    }
  }

  const [vehicle] = await db
    .insert(vehicles)
    .values({
      id: createId(),
      type: input.type,
      make: input.make,
      model: input.model,
      year: input.year,
      licensePlate: input.licensePlate,
      vin: input.vin,
      engine: input.engine,
      engineVolume: input.engineVolume,
      bodyStyle: input.bodyStyle,
      notes: input.notes,
      clientId: input.clientId,
      userId: input.userId,
    })
    .returning();

  if (!vehicle) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create vehicle" });
  }

  return vehicle;
};

export const updateVehicle = async (
  context: AuthenticatedContext,
  input: z.infer<typeof updateVehicleInputSchema>,
) => {
  await getOrgContext(context, input.organizationId);
  const clientIds = await getOrgClientIds(input.organizationId);
  const { vehicleId, organizationId: _organizationId, ...data } = input;

  const existing = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.id, vehicleId), inArray(vehicles.clientId, clientIds)),
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Vehicle not found" });
  }

  const [updated] = await db
    .update(vehicles)
    .set(data)
    .where(eq(vehicles.id, vehicleId))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Vehicle not found" });
  }

  return updated;
};

export const deleteVehicle = async (
  context: AuthenticatedContext,
  input: { organizationId: string; vehicleId: string },
) => {
  await getOrgContext(context, input.organizationId);
  const clientIds = await getOrgClientIds(input.organizationId);

  const existing = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.id, input.vehicleId), inArray(vehicles.clientId, clientIds)),
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Vehicle not found" });
  }

  await db.delete(vehicles).where(eq(vehicles.id, input.vehicleId));

  return { success: true as const };
};

export const listUserVehicles = async (
  context: Context,
): Promise<z.infer<typeof listUserVehiclesOutputSchema>> => {
  const userId = context.session!.user.id;

  return db.query.vehicles.findMany({
    where: eq(vehicles.userId, userId),
    orderBy: (v, { desc }) => [desc(v.createdAt)],
  });
};

export const createUserVehicle = async (
  context: AuthenticatedContext,
  input: z.infer<typeof createUserVehicleInputSchema>,
) => {
  const userId = context.session.user.id;

  const [vehicle] = await db
    .insert(vehicles)
    .values({
      id: createId(),
      type: input.type,
      make: input.make,
      model: input.model,
      year: input.year,
      licensePlate: input.licensePlate,
      vin: input.vin,
      engine: input.engine,
      engineVolume: input.engineVolume,
      bodyStyle: input.bodyStyle,
      notes: input.notes,
      userId,
    })
    .returning();

  if (!vehicle) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create vehicle" });
  }

  return vehicle;
};

export const updateUserVehicle = async (
  context: AuthenticatedContext,
  input: z.infer<typeof updateUserVehicleInputSchema>,
) => {
  const userId = context.session.user.id;
  const { vehicleId, ...data } = input;

  const existing = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.id, vehicleId), eq(vehicles.userId, userId)),
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Vehicle not found" });
  }

  const [updated] = await db
    .update(vehicles)
    .set(data)
    .where(eq(vehicles.id, vehicleId))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Vehicle not found" });
  }

  return updated;
};

export const deleteUserVehicle = async (
  context: AuthenticatedContext,
  input: z.infer<typeof deleteUserVehicleInputSchema>,
) => {
  const userId = context.session.user.id;

  const existing = await db.query.vehicles.findFirst({
    where: and(eq(vehicles.id, input.vehicleId), eq(vehicles.userId, userId)),
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Vehicle not found" });
  }

  await db.delete(vehicles).where(eq(vehicles.id, input.vehicleId));

  return { success: true as const };
};

export const getModels = async (
  input: z.infer<typeof getModelsInputSchema>,
): Promise<z.infer<typeof getModelsOutputSchema>> => {
  return resolveModels(input.makeId);
};
