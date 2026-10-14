import { createFileRoute } from "@tanstack/react-router";

import { OrganizationRecordsView } from "@/views/admin/organization-records-view";

export const Route = createFileRoute("/_admin/organizations/$organizationId/clients")({
  component: () => {
    const { organizationId } = Route.useParams();
    return <OrganizationRecordsView organizationId={organizationId} section="clients" />;
  },
});
