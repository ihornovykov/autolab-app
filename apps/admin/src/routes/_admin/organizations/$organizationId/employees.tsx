import { createFileRoute } from "@tanstack/react-router";

import { OrganizationRecordsView } from "@/views/admin/organization-records-view";

export const Route = createFileRoute("/_admin/organizations/$organizationId/employees")({
  component: () => {
    const { organizationId } = Route.useParams();
    return <OrganizationRecordsView organizationId={organizationId} section="employees" />;
  },
});
