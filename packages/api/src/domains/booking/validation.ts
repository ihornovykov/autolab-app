import { z } from "zod";

import { bookingOutputSchema } from "@autolab/db/validation/booking";
import { workingHoursDayInputSchema } from "@autolab/db/validation/profile-working-hours";
import {
  createPaginatedOutputSchema,
  paginationInputSchema,
  searchInputSchema,
} from "../../lib/pagination";

export const organizationIdInputSchema = z.object({
  organizationId: z.string().min(1),
});

export const bookingWithRelationsSchema = bookingOutputSchema.extend({
  vehicle: z
    .object({
      id: z.string(),
      make: z.string(),
      model: z.string(),
      year: z.number(),
      licensePlate: z.string().nullable(),
    })
    .optional(),
  employee: z
    .object({
      id: z.string(),
      userId: z.string(),
      role: z.enum(["TECHNICIAN", "MANAGER", "OWNER"]),
      name: z.string().optional(),
    })
    .optional(),
  employeeWorkingHours: z.array(workingHoursDayInputSchema).optional(),
  services: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string().nullable().optional(),
        price: z.string(),
        duration: z.number(),
      }),
    )
    .optional(),
});

export const listBookingsInputSchema = z.object({
  organizationId: z.string().min(1),
  page: paginationInputSchema.shape.page,
  pageSize: z.number().int().min(1).max(500).default(25),
  search: searchInputSchema.shape.search,
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  includeCancelled: z.boolean().optional(),
  includePast: z.boolean().optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  sort: z.enum(["asc", "desc", "upcoming"]).default("desc"),
});

export const listBookingsOutputSchema = createPaginatedOutputSchema(bookingWithRelationsSchema);

export const getBookingInputSchema = z.object({
  organizationId: z.string().min(1),
  bookingId: z.string().min(1),
});

export const getBookingOutputSchema = bookingWithRelationsSchema.nullable();

export const getBookingReceiptPdfInputSchema = getBookingInputSchema;

export const getBookingReceiptPdfOutputSchema = z.object({
  pdfBase64: z.string(),
  filename: z.string(),
  contentType: z.literal("application/pdf"),
});

export const createBookingInputSchema = z
  .object({
    organizationId: z.string().min(1),
    employeeId: z.string().min(1),
    vehicleId: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    allowsOvertime: z.boolean().optional(),
    notes: z.string().optional(),
    serviceIds: z.array(z.string().min(1)).min(1),
  })
  .refine((input) => new Date(input.endTime) > new Date(input.startTime), {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const updateBookingInputSchema = z
  .object({
    organizationId: z.string().min(1),
    bookingId: z.string().min(1),
    employeeId: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    allowsOvertime: z.boolean().optional(),
    notes: z.string().optional(),
    serviceIds: z.array(z.string().min(1)).optional(),
  })
  .refine(
    (input) => {
      if (!input.startTime || !input.endTime) return true;
      return new Date(input.endTime) > new Date(input.startTime);
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    },
  );

export const updateBookingStatusInputSchema = z.object({
  organizationId: z.string().min(1),
  bookingId: z.string().min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
});

export const deleteBookingInputSchema = z.object({
  organizationId: z.string().min(1),
  bookingId: z.string().min(1),
});

export const dashboardStatsInputSchema = z.object({
  organizationId: z.string().min(1),
});

export const dashboardStatsOutputSchema = z.object({
  bookingsToday: z.number(),
  inProgress: z.number(),
  revenueThisWeek: z.string(),
  newClientsThisWeek: z.number(),
  todayBookings: z.array(bookingWithRelationsSchema),
});
