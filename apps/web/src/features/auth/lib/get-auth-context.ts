import { createServerFn } from "@tanstack/react-start";

import { client } from "@/shared/api/orpc";
import { authMiddleware } from "@/shared/middleware/auth";

const defaultOnboardingStatus = {
  needsOnboarding: false,
  isProfileComplete: false,
  hasOrganization: false,
} as const;

export const getAuthContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const session = context.session;
    const onboardingStatus = session
      ? await client.profile.getOnboardingStatus()
      : defaultOnboardingStatus;

    return { session, onboardingStatus };
  });
