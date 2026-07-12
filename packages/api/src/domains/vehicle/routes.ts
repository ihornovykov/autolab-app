import { z } from "zod";

import { vehicleOutputSchema } from "@autolab/db/validation/vehicle";

import { orgProcedure, protectedProcedure, publicProcedure } from "../..";

import {
  createVehicle,
  createUserVehicle,
  deleteUserVehicle,
  deleteVehicle,
  getModels,
  getVehicleById,
  listUserVehicles,
  listVehicles,
  updateUserVehicle,
  updateVehicle,
} from "./services";
import {
  createVehicleInputSchema,
  createUserVehicleInputSchema,
  deleteUserVehicleInputSchema,
  deleteVehicleInputSchema,
  getModelsInputSchema,
  getModelsOutputSchema,
  getVehicleInputSchema,
  getVehicleOutputSchema,
  listUserVehiclesOutputSchema,
  listVehiclesInputSchema,
  listVehiclesOutputSchema,
  updateUserVehicleInputSchema,
  updateVehicleInputSchema,
} from "./validation";

const successSchema = z.object({ success: z.literal(true) });

export const vehicleRoutes = {
  listVehicles: orgProcedure
    .input(listVehiclesInputSchema)
    .output(listVehiclesOutputSchema)
    .handler(async ({ context, input }) => listVehicles(context, input)),

  getVehicleById: orgProcedure
    .input(getVehicleInputSchema)
    .output(getVehicleOutputSchema)
    .handler(async ({ context, input }) => getVehicleById(context, input)),

  createVehicle: orgProcedure
    .input(createVehicleInputSchema)
    .output(vehicleOutputSchema)
    .handler(async ({ context, input }) => createVehicle(context, input)),

  updateVehicle: orgProcedure
    .input(updateVehicleInputSchema)
    .output(vehicleOutputSchema)
    .handler(async ({ context, input }) => updateVehicle(context, input)),

  deleteVehicle: orgProcedure
    .input(deleteVehicleInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteVehicle(context, input)),

  listUserVehicles: protectedProcedure
    .output(listUserVehiclesOutputSchema)
    .handler(async ({ context }) => listUserVehicles(context)),

  createUserVehicle: protectedProcedure
    .input(createUserVehicleInputSchema)
    .output(vehicleOutputSchema)
    .handler(async ({ context, input }) => createUserVehicle(context, input)),

  updateUserVehicle: protectedProcedure
    .input(updateUserVehicleInputSchema)
    .output(vehicleOutputSchema)
    .handler(async ({ context, input }) => updateUserVehicle(context, input)),

  deleteUserVehicle: protectedProcedure
    .input(deleteUserVehicleInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteUserVehicle(context, input)),

  getModels: publicProcedure
    .input(getModelsInputSchema)
    .output(getModelsOutputSchema)
    .handler(async ({ input }) => getModels(input)),
};
