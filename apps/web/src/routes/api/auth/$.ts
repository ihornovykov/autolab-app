import { auth } from "@autolab/auth";
import { createFileRoute } from "@tanstack/react-router";

import { corsPreflight, withCors } from "@/shared/lib/cors";

const handleAuth = async ({ request }: { request: Request }) => {
  if (request.method === "OPTIONS") return corsPreflight(request);
  return withCors(request, await auth.handler(request));
};

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      OPTIONS: handleAuth,
      GET: handleAuth,
      POST: handleAuth,
      PUT: handleAuth,
      PATCH: handleAuth,
      DELETE: handleAuth,
    },
  },
});
