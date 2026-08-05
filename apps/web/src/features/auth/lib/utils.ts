import { createServerFn } from "@tanstack/react-start";

import { isPolarEnabled } from "@autolab/auth/lib/payments";
import { clearQueryClientCache, client } from "@/shared/api/orpc";
import { authMiddleware } from "@/shared/middleware/auth";
import { useOrganizationStore } from "@/shared/stores/organization";

const defaultOnboardingStatus = {
  needsOnboarding: false,
  isProfileComplete: false,
  hasOrganization: false,
} as const;

export const getUser = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    return context.session;
  });

export const getAuthContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const session = context.session;
    const onboardingStatus = session
      ? await client.profile.getOnboardingStatus()
      : defaultOnboardingStatus;

    return { session, onboardingStatus };
  });

type AuthContext = Awaited<ReturnType<typeof getAuthContext>>;

const AUTH_CONTEXT_CACHE_TTL_MS = 30_000;

let cachedAuthContext: AuthContext | null = null;
let cachedAt = 0;

export const clearAuthContextCache = () => {
  cachedAuthContext = null;
  cachedAt = 0;
  clearQueryClientCache();
  useOrganizationStore.getState().setSelectedOrganizationId(null);
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

export const getOnboardingStatus = createServerFn({ method: "GET" }).handler(async () =>
  client.profile.getOnboardingStatus(),
);

export const getPayment = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    if (!isPolarEnabled()) {
      return null;
    }

    return null;
  });

export const getPasswordResetRedirectUrl = () => {
  if (typeof window === "undefined") {
    return "/auth/reset-password";
  }

  return `${window.location.origin}/auth/reset-password`;
};
