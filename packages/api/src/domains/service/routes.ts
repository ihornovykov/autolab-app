import { z } from "zod";

import { serviceOutputSchema } from "@autolab/db/validation/service";

import { orgProcedure } from "../..";

import {
  createService,
  deleteManyServices,
  deleteService,
  listServices,
  updateService,
} from "./services";
import {
  createServiceInputSchema,
  deleteManyServicesInputSchema,
  deleteServiceInputSchema,
  listServicesInputSchema,
  listServicesOutputSchema,
  updateServiceInputSchema,
} from "./validation";

const successSchema = z.object({ success: z.literal(true) });

export const serviceRoutes = {
  listServices: orgProcedure
    .input(listServicesInputSchema)
    .output(listServicesOutputSchema)
    .handler(async ({ context, input }) => listServices(context, input)),

  createService: orgProcedure
    .input(createServiceInputSchema)
    .output(serviceOutputSchema)
    .handler(async ({ context, input }) => createService(context, input)),

  updateService: orgProcedure
    .input(updateServiceInputSchema)
    .output(serviceOutputSchema)
    .handler(async ({ context, input }) => updateService(context, input)),

  deleteService: orgProcedure
    .input(deleteServiceInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteService(context, input)),

  deleteManyServices: orgProcedure
    .input(deleteManyServicesInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteManyServices(context, input)),
};
