import { z } from "zod";

import {
  paginationInputSchema,
  createPaginatedOutputSchema,
} from "../../lib/pagination";

const sortDirectionSchema = z.enum(["asc", "desc"]).default("desc");

export const overviewInputSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export const overviewOutputSchema = z.object({
  organizations: z.object({
    total: z.number(),
    createdInRange: z.number(),
  }),
  users: z.object({
    total: z.number(),
    createdInRange: z.number(),
    platformAdmins: z.number(),
  }),
  bookings: z.object({
    totalInRange: z.number(),
    byStatus: z.object({
      PENDING: z.number(),
      IN_PROGRESS: z.number(),
      COMPLETED: z.number(),
      CANCELLED: z.number(),
    }),
    completedRevenueInRange: z.string(),
  }),
});

export const listOrganizationsInputSchema = paginationInputSchema.extend({
  search: z.string().optional(),
  sort: z.enum(["createdAt", "name"]).default("createdAt"),
  direction: sortDirectionSchema,
});

const organizationListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  employeeCount: z.number(),
  bookingCount: z.number(),
  createdAt: z.string(),
});

export const listOrganizationsOutputSchema = createPaginatedOutputSchema(organizationListItemSchema);

export const organizationIdSchema = z.object({ id: z.string().min(1) });

const employeeRoleSchema = z.enum(["OWNER", "MANAGER", "TECHNICIAN"]);

export const createOrganizationInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.string().email(), z.literal("")]).optional(),
  website: z.string().optional(),
  ownerEmail: z.union([z.string().email(), z.literal("")]).optional(),
});

export const createEmployeeInputSchema = z.object({
  organizationId: z.string().min(1),
  email: z.string().email(),
  role: employeeRoleSchema.default("TECHNICIAN"),
});

export const updateEmployeeInputSchema = z.object({
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  role: employeeRoleSchema.optional(),
  isActive: z.boolean().optional(),
});

export const deleteEmployeeInputSchema = z.object({
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
});

export const createClientInputSchema = z.object({
  organizationId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().optional(),
  phone: z.string().optional(),
});

export const deleteClientInputSchema = z.object({
  organizationId: z.string().min(1),
  clientId: z.string().min(1),
});

export const createVehicleInputSchema = z.object({
  organizationId: z.string().min(1),
  clientId: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  licensePlate: z.string().optional(),
});

export const deleteVehicleInputSchema = z.object({
  organizationId: z.string().min(1),
  vehicleId: z.string().min(1),
});

export const createServiceInputSchema = z.object({
  organizationId: z.string().min(1),
  title: z.string().min(1),
  category: z.string().optional(),
  price: z.string().min(1),
  duration: z.number().int().positive(),
});

export const deleteServiceInputSchema = z.object({
  organizationId: z.string().min(1),
  serviceId: z.string().min(1),
});

export const createBookingInputSchema = z.object({
  organizationId: z.string().min(1),
  employeeId: z.string().min(1),
  vehicleId: z.string().min(1),
  serviceId: z.string().min(1),
  startTime: z.string().datetime(),
  quantity: z.number().int().min(1).max(99).default(1),
});

export const deleteBookingInputSchema = z.object({
  organizationId: z.string().min(1),
  bookingId: z.string().min(1),
});

const nullableText = z.string().nullable().optional();

const timeValueSchema = z
  .string()
  .regex(/^\d{2}:\d{2}(:\d{2})?$/)
  .nullable();

export const workingHoursDayInputSchema = z.object({
  weekday: z.number().int().min(1).max(7),
  openTime: timeValueSchema,
  closeTime: timeValueSchema,
  isClosed: z.boolean(),
});

export const updateOrganizationInputSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  logo: nullableText,
  description: nullableText,
  address: nullableText,
  phone: nullableText,
  email: nullableText,
  website: nullableText,
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  workingHours: z.array(workingHoursDayInputSchema).length(7).optional(),
});

export const updateClientInputSchema = z.object({
  organizationId: z.string().min(1),
  clientId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: nullableText,
  middleName: nullableText,
  phone: nullableText,
});

const vehicleTypeSchema = z.enum(["CAR", "MOTORCYCLE", "TRUCK", "VAN", "BUS", "OTHER"]);

export const updateVehicleInputSchema = z.object({
  organizationId: z.string().min(1),
  vehicleId: z.string().min(1),
  clientId: z.string().min(1),
  type: vehicleTypeSchema,
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  licensePlate: nullableText,
  vin: nullableText,
  engine: nullableText,
  engineVolume: z.number().positive().nullable().optional(),
  bodyStyle: nullableText,
  notes: nullableText,
});

export const updateServiceInputSchema = z.object({
  organizationId: z.string().min(1),
  serviceId: z.string().min(1),
  title: z.string().min(1),
  category: nullableText,
  description: nullableText,
  price: z.string().min(1),
  duration: z.number().int().positive(),
});

export const updateBookingInputSchema = z
  .object({
    organizationId: z.string().min(1),
    bookingId: z.string().min(1),
    employeeId: z.string().min(1),
    vehicleId: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    allowsOvertime: z.boolean(),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    notes: nullableText,
    totalPrice: z.string().min(1),
    items: z
      .array(
        z.object({
          serviceId: z.string().min(1),
          quantity: z.number().int().min(1).max(99),
          unitPrice: z.string().min(1),
          duration: z.number().int().positive(),
        }),
      )
      .min(1),
  })
  .refine((input) => new Date(input.endTime) > new Date(input.startTime), {
    message: "Час завершення має бути пізніше за початок",
    path: ["endTime"],
  });

export const listUsersInputSchema = paginationInputSchema.extend({
  search: z.string().optional(),
  platformAdmin: z.boolean().optional(),
  sort: z.enum(["createdAt", "email"]).default("createdAt"),
  direction: sortDirectionSchema,
});

const userListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  isPlatformAdmin: z.boolean(),
  employeeMembershipCount: z.number(),
  createdAt: z.string(),
});

export const listUsersOutputSchema = createPaginatedOutputSchema(userListItemSchema);

export const listBookingsInputSchema = paginationInputSchema.extend({
  search: z.string().optional(),
  organizationId: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  from: z.string().optional(),
  to: z.string().optional(),
});

const bookingListItemSchema = z.object({
  id: z.string(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  startTime: z.string(),
  endTime: z.string(),
  totalPrice: z.string(),
  organization: z.object({ id: z.string(), name: z.string(), slug: z.string() }),
  vehicle: z.object({
    id: z.string(),
    make: z.string(),
    model: z.string(),
    licensePlate: z.string().nullable(),
  }),
  employeeName: z.string(),
});

export const listBookingsOutputSchema = createPaginatedOutputSchema(bookingListItemSchema);

export const setBookingStatusInputSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
  reason: z.string().min(1).max(500),
});

export const organizationScopeInputSchema = paginationInputSchema.extend({
  organizationId: z.string().min(1),
  search: z.string().optional(),
});

export const makeInputSchema = z.object({ name: z.string().min(1) });
export const updateMakeInputSchema = makeInputSchema.extend({ id: z.string().min(1) });

export const listModelsInputSchema = paginationInputSchema.extend({
  makeId: z.string().min(1),
  search: z.string().optional(),
});

export const modelInputSchema = z.object({
  makeId: z.string().min(1),
  name: z.string().min(1),
  yearFrom: z.number().int().nullable().optional(),
  yearTo: z.number().int().nullable().optional(),
});

export const updateModelInputSchema = modelInputSchema.extend({ id: z.string().min(1) });
