import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { RouterClient } from "@orpc/server";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import type { AppRouter } from "@autolab/api/routers/index";

import { apiUrl } from "@/shared/lib/auth";

const link = new RPCLink({
  url: `${apiUrl}/api/rpc`,
  fetch: (url, options) =>
    fetch(url, {
      ...options,
      credentials: "include",
    }),
});

export const client: RouterClient<AppRouter> = createORPCClient(link);

export const orpc = createTanstackQueryUtils(client);
