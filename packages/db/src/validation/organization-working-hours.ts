import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { organizationWorkingHours } from "../schema/organization-working-hours";

export const organizationWorkingHoursSelectSchema = createSelectSchema(organizationWorkingHours);
export type OrganizationWorkingHours = z.infer<typeof organizationWorkingHoursSelectSchema>;

export const workingHoursDayInputSchema = z.object({
  weekday: z.number().int().min(1).max(7),
  openTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .nullable(),
  closeTime: z
    .string()
    .regex(/^\d{2}:\d{2}(:\d{2})?$/)
    .nullable(),
  isClosed: z.boolean(),
});

export const workingHoursOutputSchema = z.array(organizationWorkingHoursSelectSchema);
export type WorkingHoursDayInput = z.infer<typeof workingHoursDayInputSchema>;
