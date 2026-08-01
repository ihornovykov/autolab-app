import { getAuthContext } from "@/features/auth/lib/get-auth-context";

type AuthContext = Awaited<ReturnType<typeof getAuthContext>>;

const AUTH_CONTEXT_CACHE_TTL_MS = 30_000;

let cachedAuthContext: AuthContext | null = null;
let cachedAt = 0;

export const clearAuthContextCache = () => {
  cachedAuthContext = null;
  cachedAt = 0;
};

export const resolveAuthContext = async (): Promise<AuthContext> => {
  const isCacheFresh =
    typeof window !== "undefined" &&
    cachedAuthContext &&
    Date.now() - cachedAt < AUTH_CONTEXT_CACHE_TTL_MS;

  if (isCacheFresh && cachedAuthContext) {
    return cachedAuthContext;
  }

  const authContext = await getAuthContext();

  if (typeof window !== "undefined") {
    cachedAuthContext = authContext;
    cachedAt = Date.now();
  }

  return authContext;
};
