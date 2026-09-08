import { z } from "zod";

import { orgProcedure, publicProcedure } from "../..";

import {
  createBooking,
  createBookingShareToken,
  deleteBooking,
  exportOrganizationAnalyticsPdf,
  generateBookingReceiptPdf,
  getBookingById,
  getDashboardStats,
  getPublicBooking,
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
  createBookingShareTokenOutputSchema,
  getPublicBookingInputSchema,
  publicBookingOutputSchema,
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

  createBookingShareToken: orgProcedure
    .input(getBookingInputSchema)
    .output(createBookingShareTokenOutputSchema)
    .handler(async ({ context, input }) => createBookingShareToken(context, input)),

  getPublicBooking: publicProcedure
    .input(getPublicBookingInputSchema)
    .output(publicBookingOutputSchema)
    .handler(async ({ input }) => getPublicBooking(input)),

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
