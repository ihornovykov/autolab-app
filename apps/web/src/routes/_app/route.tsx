import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthContext } from "@/features/auth/lib/utils";

const AppLayout = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/_app")({
  component: AppLayout,
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
