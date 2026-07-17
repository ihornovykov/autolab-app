import { z } from "zod";

import { orgProcedure } from "../..";

import {
  createBooking,
  deleteBooking,
  exportOrganizationAnalyticsPdf,
  generateBookingReceiptPdf,
  getBookingById,
  getDashboardStats,
  getOrganizationAnalytics,
  listBookings,
  listOrganizationAnalyticsBookings,
  listVehicleBookings,
  updateBooking,
  updateBookingStatus,
} from "./services";
import {
  bookingWithRelationsSchema,
  createBookingInputSchema,
  dashboardStatsInputSchema,
  dashboardStatsOutputSchema,
  deleteBookingInputSchema,
  exportOrganizationAnalyticsPdfInputSchema,
  exportOrganizationAnalyticsPdfOutputSchema,
  getBookingInputSchema,
  getBookingOutputSchema,
  getBookingReceiptPdfInputSchema,
  getBookingReceiptPdfOutputSchema,
  listBookingsInputSchema,
  listBookingsOutputSchema,
  organizationAnalyticsBookingsInputSchema,
  organizationAnalyticsBookingsOutputSchema,
  organizationAnalyticsInputSchema,
  organizationAnalyticsOutputSchema,
  updateBookingInputSchema,
  updateBookingStatusInputSchema,
} from "./validation";
import {
  listVehicleBookingsInputSchema,
  listVehicleBookingsOutputSchema,
} from "../vehicle/validation";

const successSchema = z.object({ success: z.literal(true) });

export const bookingRoutes = {
  listBookings: orgProcedure
    .input(listBookingsInputSchema)
    .output(listBookingsOutputSchema)
    .handler(async ({ context, input }) => listBookings(context, input)),

  listVehicleBookings: orgProcedure
    .input(listVehicleBookingsInputSchema)
    .output(listVehicleBookingsOutputSchema)
    .handler(async ({ context, input }) => listVehicleBookings(context, input)),

  getBookingById: orgProcedure
    .input(getBookingInputSchema)
    .output(getBookingOutputSchema)
    .handler(async ({ context, input }) => getBookingById(context, input)),

  getBookingReceiptPdf: orgProcedure
    .input(getBookingReceiptPdfInputSchema)
    .output(getBookingReceiptPdfOutputSchema)
    .handler(async ({ context, input }) => generateBookingReceiptPdf(context, input)),

  createBooking: orgProcedure
    .input(createBookingInputSchema)
    .output(bookingWithRelationsSchema)
    .handler(async ({ context, input }) => createBooking(context, input)),

  updateBooking: orgProcedure
    .input(updateBookingInputSchema)
    .output(getBookingOutputSchema)
    .handler(async ({ context, input }) => updateBooking(context, input)),

  updateBookingStatus: orgProcedure
    .input(updateBookingStatusInputSchema)
    .output(getBookingOutputSchema)
    .handler(async ({ context, input }) => updateBookingStatus(context, input)),

  deleteBooking: orgProcedure
    .input(deleteBookingInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteBooking(context, input)),

  getDashboardStats: orgProcedure
    .input(dashboardStatsInputSchema)
    .output(dashboardStatsOutputSchema)
    .handler(async ({ context, input }) => getDashboardStats(context, input)),

  getOrganizationAnalytics: orgProcedure
    .input(organizationAnalyticsInputSchema)
    .output(organizationAnalyticsOutputSchema)
    .handler(async ({ context, input }) => getOrganizationAnalytics(context, input)),

  listOrganizationAnalyticsBookings: orgProcedure
    .input(organizationAnalyticsBookingsInputSchema)
    .output(organizationAnalyticsBookingsOutputSchema)
    .handler(async ({ context, input }) => listOrganizationAnalyticsBookings(context, input)),

  exportOrganizationAnalyticsPdf: orgProcedure
    .input(exportOrganizationAnalyticsPdfInputSchema)
    .output(exportOrganizationAnalyticsPdfOutputSchema)
    .handler(async ({ context, input }) => exportOrganizationAnalyticsPdf(context, input)),
};
