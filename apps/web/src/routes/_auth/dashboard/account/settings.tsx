import { createFileRoute } from "@tanstack/react-router";

import { orpc } from "@/shared/api/orpc";
import { AccountSettingsView } from "@/views/account/account-settings-view";

export const Route = createFileRoute("/_auth/dashboard/account/settings")({
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.ensureQueryData(orpc.profile.getMyProfile.queryOptions()),
      context.queryClient.ensureQueryData(orpc.organization.listMyOrganizations.queryOptions()),
      context.queryClient.ensureQueryData(orpc.vehicle.listUserVehicles.queryOptions()),
    ]),
  component: AccountSettingsView,
});
