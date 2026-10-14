import { createFileRoute } from "@tanstack/react-router";

import { CatalogMakeDetailView } from "@/views/admin/catalog-view";

export const Route = createFileRoute("/_admin/catalog/makes/$makeId")({
  component: () => {
    const { makeId } = Route.useParams();
    return <CatalogMakeDetailView makeId={makeId} />;
  },
});
