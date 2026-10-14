import { createFileRoute } from "@tanstack/react-router";

import { OrganizationsView } from "@/views/admin/organizations-view";

export const Route = createFileRoute("/_admin/organizations/")({
  component: OrganizationsView,
});
