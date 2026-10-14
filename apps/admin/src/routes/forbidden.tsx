import { createFileRoute } from "@tanstack/react-router";

import { ForbiddenView } from "@/views/admin/forbidden-view";

export const Route = createFileRoute("/forbidden")({
  component: ForbiddenView,
});
