import { z } from "zod";

import { organizationOutputSchema } from "@autolab/db/validation/organization";

export const organizationIdInputSchema = z.object({
  organizationId: z.string().min(1),
});

export const myOrganizationOutputSchema = organizationOutputSchema.extend({
  role: z.enum(["TECHNICIAN", "MANAGER", "OWNER"]),
});

export const listOrganizationsOutputSchema = z.array(myOrganizationOutputSchema);
export type ListOrganizationsOutput = z.infer<typeof listOrganizationsOutputSchema>;

export const createOrganizationInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export const createOrganizationOutputSchema = organizationOutputSchema;
export type CreateOrganizationInput = z.infer<typeof createOrganizationInputSchema>;
export type CreateOrganizationOutput = z.infer<typeof createOrganizationOutputSchema>;

export const updateOrganizationInputSchema = createOrganizationInputSchema
  .partial()
  .extend({ organizationId: z.string().min(1) });

export const updateOrganizationOutputSchema = organizationOutputSchema;
export type UpdateOrganizationInput = z.infer<typeof updateOrganizationInputSchema>;
export type UpdateOrganizationOutput = z.infer<typeof updateOrganizationOutputSchema>;

export const deleteOrganizationInputSchema = organizationIdInputSchema;
export const deleteOrganizationOutputSchema = z.object({ success: z.literal(true) });
export type DeleteOrganizationInput = z.infer<typeof deleteOrganizationInputSchema>;
export type DeleteOrganizationOutput = z.infer<typeof deleteOrganizationOutputSchema>;

export const getOrganizationOutputSchema = organizationOutputSchema.nullable();
export type GetOrganizationOutput = z.infer<typeof getOrganizationOutputSchema>;
