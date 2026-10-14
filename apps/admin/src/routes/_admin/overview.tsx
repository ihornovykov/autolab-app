import { createFileRoute } from "@tanstack/react-router";

import { OverviewView } from "@/views/admin/overview-view";

export const Route = createFileRoute("/_admin/overview")({
  component: OverviewView,
});
