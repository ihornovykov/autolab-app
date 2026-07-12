import { orgProcedure, protectedProcedure } from "../..";

import {
  createOrganization,
  deleteOrganization,
  getOrganizationById,
  listMyOrganizations,
  updateOrganization,
} from "./services";
import {
  createOrganizationInputSchema,
  createOrganizationOutputSchema,
  deleteOrganizationInputSchema,
  deleteOrganizationOutputSchema,
  getOrganizationOutputSchema,
  listOrganizationsOutputSchema,
  organizationIdInputSchema,
  updateOrganizationInputSchema,
  updateOrganizationOutputSchema,
} from "./validation";

export const organizationRoutes = {
  listMyOrganizations: protectedProcedure
    .output(listOrganizationsOutputSchema)
    .handler(async ({ context }) => listMyOrganizations(context)),

  createOrganization: protectedProcedure
    .input(createOrganizationInputSchema)
    .output(createOrganizationOutputSchema)
    .handler(async ({ context, input }) => createOrganization(context, input)),

  getOrganizationById: orgProcedure
    .input(organizationIdInputSchema)
    .output(getOrganizationOutputSchema)
    .handler(async ({ context, input }) => getOrganizationById(context, input)),

  updateOrganization: orgProcedure
    .input(updateOrganizationInputSchema)
    .output(updateOrganizationOutputSchema)
    .handler(async ({ context, input }) => updateOrganization(context, input)),

  deleteOrganization: orgProcedure
    .input(deleteOrganizationInputSchema)
    .output(deleteOrganizationOutputSchema)
    .handler(async ({ context, input }) => deleteOrganization(context, input)),
};
