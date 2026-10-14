import { createFileRoute } from "@tanstack/react-router";

import { OrganizationHomeView } from "@/views/admin/organization-home-view";

export const Route = createFileRoute("/_admin/organizations/$organizationId/")({
  component: () => {
    const { organizationId } = Route.useParams();
    return <OrganizationHomeView organizationId={organizationId} />;
  },
});
