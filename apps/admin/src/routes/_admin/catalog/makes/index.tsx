import { createFileRoute } from "@tanstack/react-router";

import { CatalogMakesView } from "@/views/admin/catalog-view";

export const Route = createFileRoute("/_admin/catalog/makes/")({
  component: CatalogMakesView,
});
