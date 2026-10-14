import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.SSR ? undefined : window.location.origin,
  plugins: [adminClient()],
});
