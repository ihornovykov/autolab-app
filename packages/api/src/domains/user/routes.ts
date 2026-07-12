import { protectedProcedure } from "../../index";

import { getPrivateData } from "./services";
import { privateDataOutputSchema } from "./validation";

export const userRoutes = {
  privateData: protectedProcedure.output(privateDataOutputSchema).handler(({ context }) => {
    return getPrivateData(context);
  }),
};
