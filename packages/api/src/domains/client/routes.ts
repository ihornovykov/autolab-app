import { z } from "zod";

import { orgProcedure } from "../..";

import { createClient, deleteClient, getClientDetails, listClients, updateClient } from "./services";
import {
  clientDetailsOutputSchema,
  clientWithVehicleCountSchema,
  createClientInputSchema,
  deleteClientInputSchema,
  getClientDetailsInputSchema,
  listClientsInputSchema,
  listClientsOutputSchema,
  updateClientInputSchema,
} from "./validation";

const successSchema = z.object({ success: z.literal(true) });

export const clientRoutes = {
  listClients: orgProcedure
    .input(listClientsInputSchema)
    .output(listClientsOutputSchema)
    .handler(async ({ context, input }) => listClients(context, input)),

  getClientDetails: orgProcedure
    .input(getClientDetailsInputSchema)
    .output(clientDetailsOutputSchema)
    .handler(async ({ context, input }) => getClientDetails(context, input)),

  createClient: orgProcedure
    .input(createClientInputSchema)
    .output(clientWithVehicleCountSchema)
    .handler(async ({ context, input }) => createClient(context, input)),

  updateClient: orgProcedure
    .input(updateClientInputSchema)
    .output(clientWithVehicleCountSchema)
    .handler(async ({ context, input }) => updateClient(context, input)),

  deleteClient: orgProcedure
    .input(deleteClientInputSchema)
    .output(successSchema)
    .handler(async ({ context, input }) => deleteClient(context, input)),
};
