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

export const bookingServiceItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  price: z.string(),
  duration: z.number(),
  category: z.string().nullable().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.string(),
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
  services: z.array(bookingServiceItemSchema).optional(),
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

export const bookingServiceItemInputSchema = z.object({
  serviceId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
  unitPrice: z
    .string()
    .min(1)
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, {
      message: "Invalid unit price",
    }),
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
    items: z.array(bookingServiceItemInputSchema).min(1),
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
    items: z.array(bookingServiceItemInputSchema).min(1).optional(),
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

export const organizationAnalyticsInputSchema = z
  .object({
    organizationId: z.string().min(1),
    from: z.string().datetime(),
    to: z.string().datetime(),
  })
  .refine((input) => new Date(input.to) > new Date(input.from), {
    message: "End date must be after start date",
    path: ["to"],
  });

export const organizationAnalyticsBookingsInputSchema = organizationAnalyticsInputSchema.extend({
  page: paginationInputSchema.shape.page,
  pageSize: paginationInputSchema.shape.pageSize,
});

export const organizationAnalyticsBookingsOutputSchema =
  createPaginatedOutputSchema(bookingWithRelationsSchema);

const analyticsSummarySchema = z.object({
  totalBookings: z.number(),
  completedBookings: z.number(),
  cancelledBookings: z.number(),
  inProgressBookings: z.number(),
  pendingBookings: z.number(),
  totalRevenue: z.string(),
  averageTicket: z.string(),
  newClients: z.number(),
});

const analyticsComparisonSchema = analyticsSummarySchema.extend({
  totalBookingsDeltaPercent: z.number().nullable(),
  completedBookingsDeltaPercent: z.number().nullable(),
  totalRevenueDeltaPercent: z.number().nullable(),
  averageTicketDeltaPercent: z.number().nullable(),
  newClientsDeltaPercent: z.number().nullable(),
});

export const organizationAnalyticsOutputSchema = z.object({
  from: z.string().datetime(),
  to: z.string().datetime(),
  summary: analyticsComparisonSchema,
  revenueTimeSeries: z.array(
    z.object({
      date: z.string(),
      revenue: z.string(),
      bookingsCount: z.number(),
    }),
  ),
  statusBreakdown: z.array(
    z.object({
      status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
      count: z.number(),
      revenue: z.string(),
    }),
  ),
  topServices: z.array(
    z.object({
      serviceId: z.string(),
      title: z.string(),
      count: z.number(),
      revenue: z.string(),
    }),
  ),
});

export const exportOrganizationAnalyticsPdfInputSchema = organizationAnalyticsInputSchema;

export const exportOrganizationAnalyticsPdfOutputSchema = z.object({
  pdfBase64: z.string(),
  filename: z.string(),
  contentType: z.literal("application/pdf"),
});
