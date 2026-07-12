import { createServerFn } from "@tanstack/react-start";

import { isPolarEnabled } from "@autolab/auth/lib/payments";
import { authMiddleware } from "@/shared/middleware/auth";

export const getPayment = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    if (!isPolarEnabled()) {
      return null;
    }

    return null;
  });
