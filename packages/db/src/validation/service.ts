import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { services } from "../schema/service";

export const serviceSelectSchema = createSelectSchema(services);
export const serviceInsertSchema = createInsertSchema(services);

export const serviceOutputSchema = serviceSelectSchema;
export type ServiceOutput = z.infer<typeof serviceOutputSchema>;
