import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthContext } from "@/features/auth/lib/auth-context-cache";

const AuthLayout = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async ({ location }) => {
    const { session, onboardingStatus } = await resolveAuthContext();
    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    if (location.pathname !== "/onboarding" && onboardingStatus.needsOnboarding) {
      throw redirect({ to: "/onboarding" });
    }

    return { session };
  },
});
