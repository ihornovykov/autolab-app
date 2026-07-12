import { publicProcedure } from "../../index";

import { healthCheckOutputSchema } from "./validation";

export const healthRoutes = {
  healthCheck: publicProcedure.output(healthCheckOutputSchema).handler((): "OK" => {
    return "OK";
  }),
};
