import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import { AccountSettingsView } from "@/views/account/account-settings-view";

export const Route = createFileRoute("/_app/dashboard/account/settings")({
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(orpc.profile.getMyProfile.queryOptions());
    void context.queryClient.prefetchQuery(orpc.organization.listMyOrganizations.queryOptions());
    void context.queryClient.prefetchQuery(orpc.vehicle.listUserVehicles.queryOptions());
  },
  component: AccountSettingsView,
});
