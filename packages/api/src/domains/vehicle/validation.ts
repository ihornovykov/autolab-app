import { z } from "zod";

import { vehicleOutputSchema } from "@autolab/db/validation/vehicle";
import { bookingOutputSchema } from "@autolab/db/validation/booking";
import { createPaginatedOutputSchema, paginationInputSchema, searchInputSchema } from "../../lib/pagination";

export const organizationIdInputSchema = z.object({
  organizationId: z.string().min(1),
});

export const vehicleWithOwnerSchema = vehicleOutputSchema.extend({
  client: z
    .object({
      id: z.string(),
      firstName: z.string(),
      lastName: z.string().nullable(),
    })
    .nullable()
    .optional(),
});

export const listVehiclesInputSchema = z.object({
  organizationId: z.string().min(1),
  clientId: z.string().optional(),
  page: paginationInputSchema.shape.page,
  pageSize: paginationInputSchema.shape.pageSize,
  search: searchInputSchema.shape.search,
});

export const listVehiclesOutputSchema = createPaginatedOutputSchema(vehicleWithOwnerSchema);

export const getVehicleInputSchema = z.object({
  organizationId: z.string().min(1),
  vehicleId: z.string().min(1),
});

export const getVehicleOutputSchema = vehicleWithOwnerSchema.nullable();

export const createVehicleInputSchema = z.object({
  organizationId: z.string().min(1),
  type: z.enum(["CAR", "MOTORCYCLE", "TRUCK", "VAN", "BUS", "OTHER"]).default("CAR"),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  licensePlate: z.string().optional(),
  vin: z.string().optional(),
  engine: z.string().optional(),
  engineVolume: z.number().optional(),
  bodyStyle: z.string().optional(),
  notes: z.string().optional(),
  clientId: z.string().optional(),
  userId: z.string().optional(),
});

export const updateVehicleInputSchema = createVehicleInputSchema
  .partial()
  .extend({
    organizationId: z.string().min(1),
    vehicleId: z.string().min(1),
  })
  .refine((data) => Object.keys(data).length > 2, { message: "No fields to update" });

export const deleteVehicleInputSchema = z.object({
  organizationId: z.string().min(1),
  vehicleId: z.string().min(1),
});

export const listUserVehiclesOutputSchema = z.array(vehicleOutputSchema);

export const createUserVehicleInputSchema = z.object({
  type: z.enum(["CAR", "MOTORCYCLE", "TRUCK", "VAN", "BUS", "OTHER"]).default("CAR"),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  licensePlate: z.string().min(1),
  vin: z.string().optional(),
  engine: z.string().min(1),
  engineVolume: z.number().positive(),
  bodyStyle: z.string().min(1),
  notes: z.string().optional(),
});

export const updateUserVehicleInputSchema = createUserVehicleInputSchema.extend({
  vehicleId: z.string().min(1),
});

export const deleteUserVehicleInputSchema = z.object({
  vehicleId: z.string().min(1),
});

export const getModelsInputSchema = z.object({
  makeId: z.string().min(1),
  year: z.number().int().optional(),
});

export const getModelsOutputSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    yearFrom: z.number().nullable(),
    yearTo: z.number().nullable(),
  }),
);

export const bookingWithServicesSchema = bookingOutputSchema.extend({
  services: z.array(z.object({ id: z.string(), title: z.string(), price: z.string() })),
});

export const listVehicleBookingsInputSchema = z.object({
  organizationId: z.string().min(1),
  vehicleId: z.string().min(1),
  page: paginationInputSchema.shape.page,
  pageSize: paginationInputSchema.shape.pageSize,
});

export const listVehicleBookingsOutputSchema = createPaginatedOutputSchema(bookingWithServicesSchema);
