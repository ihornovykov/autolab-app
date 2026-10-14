import { env } from "@autolab/env/server";

const allowedOrigins = () =>
  [env.CORS_ORIGIN, env.ADMIN_ORIGIN].filter((origin): origin is string => !!origin);

export const withCors = (request: Request, response: Response) => {
  const origin = request.headers.get("origin");
  if (!origin || !allowedOrigins().includes(origin)) return response;

  const headers = new Headers(response.headers);
  headers.set("Access-Control-Allow-Origin", origin);
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Access-Control-Allow-Headers", request.headers.get("access-control-request-headers") ?? "*");
  headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("Vary", "Origin");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

export const corsPreflight = (request: Request) => withCors(request, new Response(null, { status: 204 }));
