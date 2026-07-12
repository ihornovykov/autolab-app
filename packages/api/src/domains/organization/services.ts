import { db } from "@autolab/db";
import { employees } from "@autolab/db/schema/employee";
import { organizations } from "@autolab/db/schema/organization";
import { ORPCError } from "@orpc/server";
import { eq } from "drizzle-orm";

import type { AuthenticatedContext } from "../../context";
import { assertOrgManager, assertOrgOwner, createId, getOrgContext, slugify } from "../../lib/org-scope";

import type {
  CreateOrganizationInput,
  CreateOrganizationOutput,
  DeleteOrganizationInput,
  DeleteOrganizationOutput,
  GetOrganizationOutput,
  ListOrganizationsOutput,
  UpdateOrganizationInput,
  UpdateOrganizationOutput,
} from "./validation";

export const listMyOrganizations = async (
  context: AuthenticatedContext,
): Promise<ListOrganizationsOutput> => {
  const userId = context.session.user.id;

  const memberships = await db.query.employees.findMany({
    where: eq(employees.userId, userId),
    with: { organization: true },
  });

  return memberships.map((membership) => ({
    ...membership.organization,
    role: membership.role,
  }));
};

export const createOrganization = async (
  context: AuthenticatedContext,
  input: CreateOrganizationInput,
): Promise<CreateOrganizationOutput> => {
  const userId = context.session.user.id;
  const baseSlug = slugify(input.name);
  let slug = baseSlug;
  let suffix = 1;

  while (await db.query.organizations.findFirst({ where: eq(organizations.slug, slug) })) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  const orgId = createId();

  const [organization] = await db
    .insert(organizations)
    .values({
      id: orgId,
      name: input.name,
      slug,
      description: input.description,
      address: input.address,
      phone: input.phone,
      email: input.email,
      website: input.website,
      latitude: input.latitude,
      longitude: input.longitude,
    })
    .returning();

  if (!organization) {
    throw new ORPCError("INTERNAL_SERVER_ERROR", { message: "Failed to create organization" });
  }

  await db.insert(employees).values({
    id: createId(),
    userId,
    organizationId: orgId,
    role: "OWNER",
  });

  return organization;
};

export const getOrganizationById = async (
  context: AuthenticatedContext,
  input: { organizationId: string },
): Promise<GetOrganizationOutput> => {
  await getOrgContext(context, input.organizationId);

  return (
    (await db.query.organizations.findFirst({
      where: eq(organizations.id, input.organizationId),
    })) ?? null
  );
};

export const updateOrganization = async (
  context: AuthenticatedContext,
  input: UpdateOrganizationInput,
): Promise<UpdateOrganizationOutput> => {
  await assertOrgManager(context.session.user.id, input.organizationId);
  const { organizationId, ...data } = input;

  const [updated] = await db
    .update(organizations)
    .set(data)
    .where(eq(organizations.id, organizationId))
    .returning();

  if (!updated) {
    throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
  }

  return updated;
};

export const deleteOrganization = async (
  context: AuthenticatedContext,
  input: DeleteOrganizationInput,
): Promise<DeleteOrganizationOutput> => {
  await assertOrgOwner(context.session.user.id, input.organizationId);

  const existing = await db.query.organizations.findFirst({
    where: eq(organizations.id, input.organizationId),
  });

  if (!existing) {
    throw new ORPCError("NOT_FOUND", { message: "Organization not found" });
  }

  await db.delete(organizations).where(eq(organizations.id, input.organizationId));

  return { success: true };
};
