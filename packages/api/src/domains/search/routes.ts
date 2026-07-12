import { protectedProcedure } from "../..";

import { globalSearch } from "./services";
import {
  globalSearchInputSchema,
  globalSearchOutputSchema,
} from "./validation";

export const searchRoutes = {
  globalSearch: protectedProcedure
    .input(globalSearchInputSchema)
    .output(globalSearchOutputSchema)
    .handler(async ({ context, input }) => globalSearch(context, input)),
};
