import { createFileRoute } from "@tanstack/react-router";

import { OrganizationLayout } from "@/views/admin/organization-layout";

export const Route = createFileRoute("/_admin/organizations/$organizationId")({
  component: () => {
    const { organizationId } = Route.useParams();
    return <OrganizationLayout organizationId={organizationId} />;
  },
});
