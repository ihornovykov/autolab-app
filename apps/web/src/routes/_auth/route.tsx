import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { getOnboardingStatus } from "@/features/auth/lib/get-onboarding-status";
import { getUser } from "@/features/auth/lib/get-user";

const AuthLayout = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async ({ location }) => {
    const session = await getUser();
    if (!session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }

    if (location.pathname !== "/onboarding") {
      const status = await getOnboardingStatus();
      if (status.needsOnboarding) {
        throw redirect({ to: "/onboarding" });
      }
    }

    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/auth/sign-in",
      });
    }
  },
});
