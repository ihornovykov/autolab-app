import { db } from "@autolab/db";
import { services } from "@autolab/db/schema/service";
import { ORPCError } from "@orpc/server";
import { and, count, eq, inArray } from "drizzle-orm";

import type { AuthenticatedContext } from "../../context";
import { assertOrgManager, createId, getOrgContext } from "../../lib/scope";
import { buildPaginatedResult, getOffset, searchPattern } from "../../lib/pagination";
import { orHomoglyphs } from "../../lib/normalize";

import type { z } from "zod";

import type {
  createServiceInputSchema,
  listServicesInputSchema,
  listServicesOutputSchema,
  updateServiceInputSchema,
} from "./validation";

export const listServices = async (
  context: AuthenticatedContext,
  input: z.infer<typeof listServicesInputSchema>,
): Promise<z.infer<typeof listServicesOutputSchema>> => {
  await getOrgContext(context, input.organizationId);

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const pattern = searchPattern(input.search);
  const offset = getOffset(page, pageSize);

  const conditions = [eq(services.organizationId, input.organizationId)];

  if (input.category) {
    conditions.push(eq(services.category, input.category));
  }

  if (pattern) {
    conditions.push(
      orHomoglyphs(pattern, services.title, services.description, services.category)!,
    );
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db.select({ count: count() }).from(services).where(whereClause);
  const total = totalResult?.count ?? 0;

  const rows = await db.query.services.findMany({
    where: whereClause,
    orderBy: (service, { asc: ascOrder }) => [ascOrder(service.title)],
    limit: pageSize,
    offset,
  });

  return buildPaginatedResult(rows, total, page, pageSize);
};

export const createService = async (
  context: AuthenticatedContext,
  input: z.infer<typeof createServiceInputSchema>,
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  const [service] = await db
    .insert(services)
    .values({
      id: createId(),
      organizationId: input.organizationId,
      category: input.category,
      title: input.title,
      description: input.description,
      price: input.price,
      duration: input.duration,
    })
    .returning();

  if (!service) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create service" });
  }

  return service;
};

export const updateService = async (
  context: AuthenticatedContext,
  input: z.infer<typeof updateServiceInputSchema>,
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  const { serviceId, organizationId, ...data } = input;

  const [updated] = await db
    .update(services)
    .set(data)
    .where(and(eq(services.id, serviceId), eq(services.organizationId, organizationId)))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Service not found" });
  }

  return updated;
};

export const deleteService = async (
  context: AuthenticatedContext,
  input: { organizationId: string; serviceId: string },
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  await db
    .delete(services)
    .where(and(eq(services.id, input.serviceId), eq(services.organizationId, input.organizationId)));

  return { success: true as const };
};

export const deleteManyServices = async (
  context: AuthenticatedContext,
  input: { organizationId: string; serviceIds: string[] },
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  await db
    .delete(services)
    .where(
      and(inArray(services.id, input.serviceIds), eq(services.organizationId, input.organizationId)),
    );

  return { success: true as const };
};
