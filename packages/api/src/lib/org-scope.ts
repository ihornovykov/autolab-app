import { db } from "@autolab/db";
import { employees } from "@autolab/db/schema/employee";
import { ORPCError } from "@orpc/server";
import { and, eq } from "drizzle-orm";

import type { AuthenticatedContext } from "../context";

export const getOrgScopedWhere = (organizationId: string) => ({
  organizationId,
});

export const assertOrgMembership = async (userId: string, organizationId: string) => {
  const membership = await db.query.employees.findFirst({
    where: and(eq(employees.userId, userId), eq(employees.organizationId, organizationId)),
  });

  if (!membership) {
    throw new ORPCError("FORBIDDEN", { message: "You do not have access to this organization" });
  }

  return membership;
};

export const getOrgContext = async (context: AuthenticatedContext, organizationId: string) => {
  const membership = await assertOrgMembership(context.session.user.id, organizationId);
  return { ...context, organizationId, membership };
};

export type OrgContext = Awaited<ReturnType<typeof getOrgContext>>;

export const assertOrgManager = async (userId: string, organizationId: string) => {
  const membership = await assertOrgMembership(userId, organizationId);

  if (membership.role === "TECHNICIAN") {
    throw new ORPCError("FORBIDDEN", { message: "Insufficient permissions" });
  }

  return membership;
};

export const assertOrgOwner = async (userId: string, organizationId: string) => {
  const membership = await assertOrgMembership(userId, organizationId);

  if (membership.role !== "OWNER") {
    throw new ORPCError("FORBIDDEN", { message: "Only organization owners can perform this action" });
  }

  return membership;
};

export const createId = () => crypto.randomUUID();

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
