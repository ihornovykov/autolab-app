import type { Context } from "../../context";

import { toPrivateDataOutput } from "./utils";
import type { PrivateDataOutput } from "./validation";

export const getPrivateData = (context: Context): PrivateDataOutput => {
  const user = context.session?.user;

  return toPrivateDataOutput(
    "This is private",
    user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image ?? null,
        }
      : null,
  );
};
