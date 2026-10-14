import { createFileRoute } from "@tanstack/react-router";

import { AdminsView } from "@/views/admin/admins-view";

export const Route = createFileRoute("/_admin/admins")({
  component: AdminsView,
});