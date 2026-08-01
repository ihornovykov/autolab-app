import { createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthContext } from "@/features/auth/lib/utils";
import { orpc } from "@/shared/api/orpc";
import { OnboardingView } from "@/views/onboarding/onboarding-view";

export const Route = createFileRoute("/_auth/onboarding")({
  beforeLoad: async () => {
    const { onboardingStatus } = await resolveAuthContext();
    if (!onboardingStatus.needsOnboarding) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(orpc.profile.getOnboardingStatus.queryOptions());
    void context.queryClient.prefetchQuery(orpc.profile.getMyProfile.queryOptions());
    void context.queryClient.prefetchQuery(orpc.profile.getMyWorkingHours.queryOptions());
  },
  component: OnboardingView,
});
