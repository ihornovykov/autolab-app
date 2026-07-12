import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { vehicles } from "../schema/vehicle";

export const vehicleSelectSchema = createSelectSchema(vehicles);
export const vehicleInsertSchema = createInsertSchema(vehicles);

export const vehicleOutputSchema = vehicleSelectSchema;
export type VehicleOutput = z.infer<typeof vehicleOutputSchema>;
