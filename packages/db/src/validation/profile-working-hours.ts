import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { profileWorkingHours } from "../schema/profile-working-hours";

export const profileWorkingHoursSelectSchema = createSelectSchema(profileWorkingHours);
export type ProfileWorkingHours = z.infer<typeof profileWorkingHoursSelectSchema>;

export const workingHoursDayInputSchema = z.object({
  weekday: z.number().int().min(1).max(7),
  openTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  closeTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/).nullable(),
  isClosed: z.boolean(),
});

export const workingHoursOutputSchema = z.array(profileWorkingHoursSelectSchema);
export type WorkingHoursDayInput = z.infer<typeof workingHoursDayInputSchema>;
