import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { organizations } from "../schema/organization";

export const organizationSelectSchema = createSelectSchema(organizations);
export const organizationInsertSchema = createInsertSchema(organizations);

export const organizationOutputSchema = organizationSelectSchema;
export type OrganizationOutput = z.infer<typeof organizationOutputSchema>;
