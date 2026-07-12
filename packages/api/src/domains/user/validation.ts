import { z } from "zod";

import { userPublicSchema } from "@autolab/db/validation/auth";

export const privateDataOutputSchema = z.object({
  message: z.string(),
  user: userPublicSchema.nullish(),
});

export type PrivateDataOutput = z.infer<typeof privateDataOutputSchema>;
