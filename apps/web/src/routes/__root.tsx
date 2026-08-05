import { Toaster } from "@autolab/ui/components/sonner";
import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { createMiddleware } from "@tanstack/react-start";
import { evlogErrorHandler } from "evlog/nitro/v3";
import { ThemeProvider } from "next-themes";

import { NuqsProvider } from "@/shared/ui/nuqs-provider";

import type { orpc } from "@/shared/api/orpc";
import { DialogHost } from "@/shared/ui/dialog-host";
import { SheetHost } from "@/shared/ui/sheet-host";

import appCss from "@/shared/styles/index.css?url";

export type RouterAppContext = {
  orpc: typeof orpc;
  queryClient: QueryClient;
};

const RootDocument = () => (
  <html lang="uk" suppressHydrationWarning>
    <head>
      <HeadContent />
    </head>
    <body>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <NuqsProvider>
          <Outlet />
          <DialogHost />
          <SheetHost />
          <Toaster richColors position="bottom-right" />
          <TanStackRouterDevtools position="bottom-left" />
          <ReactQueryDevtools position="bottom" buttonPosition="bottom-right" />
        </NuqsProvider>
      </ThemeProvider>
      <Scripts />
    </body>
  </html>
);

export const Route = createRootRouteWithContext<RouterAppContext>()({
  server: {
    middleware: [createMiddleware().server(evlogErrorHandler)],
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Autolab" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootDocument,
});
