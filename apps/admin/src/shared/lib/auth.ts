import { adminClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

export const authClient = createAuthClient({
  baseURL: apiUrl,
  fetchOptions: {
    credentials: "include",
  },
  plugins: [adminClient()],
});

export const isPlatformAdmin = (role?: string | null) =>
  (role ?? "")
    .split(",")
    .map((value) => value.trim())
    .includes("admin");
