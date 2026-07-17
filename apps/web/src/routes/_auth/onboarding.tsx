import { createFileRoute, redirect } from "@tanstack/react-router";

import { getOnboardingStatus } from "@/features/auth/lib/get-onboarding-status";
import { orpc } from "@/shared/api/orpc";
import { OnboardingView } from "@/views/onboarding/onboarding-view";

export const Route = createFileRoute("/_auth/onboarding")({
  beforeLoad: async () => {
    const status = await getOnboardingStatus();
    if (!status.needsOnboarding) {
      throw redirect({ to: "/dashboard" });
    }
  },
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(orpc.profile.getOnboardingStatus.queryOptions()),
      context.queryClient.ensureQueryData(orpc.profile.getMyProfile.queryOptions()),
      context.queryClient.ensureQueryData(orpc.profile.getMyWorkingHours.queryOptions()),
    ]),
  component: OnboardingView,
});
