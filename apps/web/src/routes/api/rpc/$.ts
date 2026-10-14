import { createContext } from "@autolab/api/context";
import { appRouter } from "@autolab/api/routers/index";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";

import { corsPreflight, withCors } from "@/shared/lib/cors";

const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      console.error(error);
    }),
  ],
});

async function handle({ request }: { request: Request }) {
  if (request.method === "OPTIONS") return corsPreflight(request);

  const rpcResult = await rpcHandler.handle(request, {
    prefix: "/api/rpc",
    context: await createContext({ req: request }),
  });
  if (rpcResult.response) return withCors(request, rpcResult.response);

  const apiResult = await apiHandler.handle(request, {
    prefix: "/api/rpc/api-reference",
    context: await createContext({ req: request }),
  });
  if (apiResult.response) return withCors(request, apiResult.response);

  return withCors(request, new Response("Not found", { status: 404 }));
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      OPTIONS: handle,
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
