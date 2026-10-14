import { createFileRoute } from "@tanstack/react-router";

import { UsersView } from "@/views/admin/users-view";

export const Route = createFileRoute("/_admin/users/")({
  component: UsersView,
});
