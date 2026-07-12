import { z } from "zod";

import { clientOutputSchema } from "@autolab/db/validation/client";
import { vehicleOutputSchema } from "@autolab/db/validation/vehicle";
import { createPaginatedOutputSchema, paginationInputSchema, searchInputSchema } from "../../lib/pagination";

import { bookingWithRelationsSchema } from "../booking/validation";

export const organizationIdInputSchema = z.object({
  organizationId: z.string().min(1),
});

export const clientWithVehicleCountSchema = clientOutputSchema.extend({
  vehicleCount: z.number(),
  email: z.string().nullable().optional(),
});

export const listClientsInputSchema = organizationIdInputSchema.extend({
  page: paginationInputSchema.shape.page,
  pageSize: paginationInputSchema.shape.pageSize,
  search: searchInputSchema.shape.search,
});

export const listClientsOutputSchema = createPaginatedOutputSchema(clientWithVehicleCountSchema);

export const getClientDetailsInputSchema = z.object({
  organizationId: z.string().min(1),
  clientId: z.string().min(1),
});

export const clientDetailsOutputSchema = z.object({
  client: clientWithVehicleCountSchema,
  vehicles: z.array(vehicleOutputSchema),
  bookings: z.array(bookingWithRelationsSchema),
});

export const createClientInputSchema = z.object({
  organizationId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  middleName: z.string().optional(),
  phone: z.string().optional(),
  userId: z.string().optional(),
});

export const updateClientInputSchema = createClientInputSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    clientId: z.string().min(1),
  })
  .refine((data) => Object.keys(data).length > 2, { message: "No fields to update" });

export const deleteClientInputSchema = z.object({
  organizationId: z.string().min(1),
  clientId: z.string().min(1),
});
