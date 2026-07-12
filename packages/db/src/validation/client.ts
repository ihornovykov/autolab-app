import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { clients } from "../schema/client";

export const clientSelectSchema = createSelectSchema(clients);
export const clientInsertSchema = createInsertSchema(clients);

export const clientOutputSchema = clientSelectSchema;
export type ClientOutput = z.infer<typeof clientOutputSchema>;
