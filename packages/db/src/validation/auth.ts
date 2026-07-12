import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

import { users } from "../schema/auth";

export const userSelectSchema = createSelectSchema(users);

export const userPublicSchema = userSelectSchema.pick({
  id: true,
  name: true,
  email: true,
  image: true,
});

export type UserPublic = z.infer<typeof userPublicSchema>;
