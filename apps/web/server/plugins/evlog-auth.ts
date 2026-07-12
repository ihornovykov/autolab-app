import { auth } from "@autolab/auth";
import { createAuthMiddleware } from "evlog/better-auth";
import { useLogger } from "evlog/nitro/v3";
import { definePlugin } from "nitro";

const identify = createAuthMiddleware(auth, {
  exclude: ["/api/auth/**"],
  maskEmail: true,
});

export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    if (!event.req.context?.log) return;

    const path = new URL(event.req.url, "http://localhost").pathname;
    const headers: Record<string, string> = {};
    event.req.headers.forEach((value, key) => {
      headers[key] = value;
    });

    await identify(useLogger(event), headers, path);
  });
});
