import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { profiles } from "../schema/profile";

export const profileSelectSchema = createSelectSchema(profiles);
export const profileInsertSchema = createInsertSchema(profiles);

export const profileOutputSchema = profileSelectSchema.pick({
  id: true,
  userId: true,
  firstName: true,
  lastName: true,
  middleName: true,
  phone: true,
});

export type ProfileOutput = z.infer<typeof profileOutputSchema>;
