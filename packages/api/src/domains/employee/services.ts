import { db } from "@autolab/db";
import { users } from "@autolab/db/schema/auth";
import { employees } from "@autolab/db/schema/employee";
import { profiles } from "@autolab/db/schema/profile";
import { ORPCError } from "@orpc/server";
import { and, count, desc, eq, inArray } from "drizzle-orm";

import type { AuthenticatedContext } from "../../index";
import { assertOrgManager, createId, getOrgContext } from "../../lib/org-scope";
import { buildPaginatedResult, getOffset, searchPattern } from "../../lib/pagination";
import { orHomoglyphs } from "../../lib/search-normalize";
import { getWorkingHoursForUserId } from "../profile/services";

import type { z } from "zod";

import type {
  findEmployeeByEmailInputSchema,
  inviteEmployeeInputSchema,
  listEmployeesInputSchema,
  listEmployeesOutputSchema,
  updateEmployeeInputSchema,
} from "./validation";

export const listEmployees = async (
  context: AuthenticatedContext,
  input: z.infer<typeof listEmployeesInputSchema>,
): Promise<z.infer<typeof listEmployeesOutputSchema>> => {
  await getOrgContext(context, input.organizationId);

  const page = input.page ?? 1;
  const pageSize = input.pageSize ?? 25;
  const pattern = searchPattern(input.search);
  const offset = getOffset(page, pageSize);

  const conditions = [eq(employees.organizationId, input.organizationId)];

  if (input.roles?.length) {
    conditions.push(inArray(employees.role, input.roles));
  }

  if (pattern) {
    conditions.push(orHomoglyphs(pattern, users.name, users.email)!);
  }

  const whereClause = and(...conditions);

  const [totalResult] = await db
    .select({ count: count() })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(whereClause);

  const total = totalResult?.count ?? 0;

  const rows = await db
    .select({
      employee: employees,
      user: users,
      profile: profiles,
    })
    .from(employees)
    .innerJoin(users, eq(employees.userId, users.id))
    .leftJoin(profiles, eq(profiles.userId, users.id))
    .where(whereClause)
    .orderBy(desc(employees.startDate))
    .limit(pageSize)
    .offset(offset);

  const items = rows.map((row) => ({
    ...row.employee,
    user: {
      id: row.user.id,
      name: row.user.name,
      email: row.user.email,
      image: row.user.image,
      profile: row.profile
        ? {
            firstName: row.profile.firstName,
            lastName: row.profile.lastName,
            phone: row.profile.phone,
          }
        : null,
    },
  }));

  return buildPaginatedResult(items, total, page, pageSize);
};

export const updateEmployee = async (
  context: AuthenticatedContext,
  input: z.infer<typeof updateEmployeeInputSchema>,
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  const [updated] = await db
    .update(employees)
    .set({
      role: input.role,
      isActive: input.isActive,
    })
    .where(
      and(
        eq(employees.id, input.employeeId),
        eq(employees.organizationId, input.organizationId),
      ),
    )
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Employee not found" });
  }

  return updated;
};

export const deleteEmployee = async (
  context: AuthenticatedContext,
  input: { organizationId: string; employeeId: string },
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  await db
    .delete(employees)
    .where(
      and(eq(employees.id, input.employeeId), eq(employees.organizationId, input.organizationId)),
    );

  return { success: true as const };
};

export const deleteManyEmployees = async (
  context: AuthenticatedContext,
  input: { organizationId: string; employeeIds: string[] },
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  await db
    .delete(employees)
    .where(
      and(
        inArray(employees.id, input.employeeIds),
        eq(employees.organizationId, input.organizationId),
      ),
    );

  return { success: true as const };
};

export const findEmployeeByEmail = async (
  context: AuthenticatedContext,
  input: z.infer<typeof findEmployeeByEmailInputSchema>,
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  const user = await db.query.users.findFirst({ where: eq(users.email, input.email) });

  if (!user) return null;

  const profile = await db.query.profiles.findFirst({ where: eq(profiles.userId, user.id) });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    profile: profile ? { phone: profile.phone } : null,
  };
};

export const inviteEmployee = async (
  context: AuthenticatedContext,
  input: z.infer<typeof inviteEmployeeInputSchema>,
) => {
  await assertOrgManager(context.session.user.id, input.organizationId);

  const existing = await db.query.employees.findFirst({
    where: and(
      eq(employees.userId, input.userId),
      eq(employees.organizationId, input.organizationId),
    ),
  });

  if (existing) {
    throw new ORPCError("CONFLICT", { message: "User is already an employee" });
  }

  const [employee] = await db
    .insert(employees)
    .values({
      id: createId(),
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role,
    })
    .returning();

  if (!employee) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to invite employee" });
  }

  return employee;
};

export const getEmployeeWorkingHours = async (
  context: AuthenticatedContext,
  input: { organizationId: string; employeeId: string },
) => {
  await getOrgContext(context, input.organizationId);

  const employee = await db.query.employees.findFirst({
    where: and(
      eq(employees.id, input.employeeId),
      eq(employees.organizationId, input.organizationId),
    ),
    columns: { userId: true },
  });

  if (!employee) {
    throw new ORPCError("NOT_FOUND", { message: "Employee not found" });
  }

  return getWorkingHoursForUserId(employee.userId);
};
