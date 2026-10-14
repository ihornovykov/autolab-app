import * as Sentry from "@sentry/tanstackstart-react";
import { createBrowserHistory, createRouter as createTanStackRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { createQueryClient, orpc, registerQueryClient } from "@/shared/api/orpc";
import { decodeUnicodeHref, parseSearch, stringifySearch } from "@/shared/lib/search-params";

import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = createQueryClient();
  registerQueryClient(queryClient);

  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 30_000,
    parseSearch,
    stringifySearch,
    ...(typeof document === "undefined"
      ? {}
      : { history: createBrowserHistory({ createHref: decodeUnicodeHref }) }),
    context: { orpc, queryClient },
    defaultNotFoundComponent: () => <div>Not Found</div>,
  });

  if (!router.isServer) {
    Sentry.addIntegration(Sentry.tanstackRouterBrowserTracingIntegration(router));
  }

  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
};

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
