import { z } from "zod";

import { serviceOutputSchema } from "@autolab/db/validation/service";
import { createPaginatedOutputSchema, paginationInputSchema, searchInputSchema } from "../../lib/pagination";

export const organizationIdInputSchema = z.object({
  organizationId: z.string().min(1),
});

export const listServicesInputSchema = organizationIdInputSchema.extend({
  page: paginationInputSchema.shape.page,
  pageSize: paginationInputSchema.shape.pageSize,
  search: searchInputSchema.shape.search,
});

export const listServicesOutputSchema = createPaginatedOutputSchema(serviceOutputSchema);

export const createServiceInputSchema = z.object({
  organizationId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  price: z.string().min(1),
  duration: z.number().int().positive(),
});

export const updateServiceInputSchema = createServiceInputSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    serviceId: z.string().min(1),
  })
  .refine((data) => Object.keys(data).length > 2, { message: "No fields to update" });

export const deleteServiceInputSchema = z.object({
  organizationId: z.string().min(1),
  serviceId: z.string().min(1),
});

export const deleteManyServicesInputSchema = z.object({
  organizationId: z.string().min(1),
  serviceIds: z.array(z.string().min(1)).min(1),
});
