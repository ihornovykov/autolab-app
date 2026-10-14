import { createFileRoute } from "@tanstack/react-router";

import { UserDetailView } from "@/views/admin/user-detail-view";

export const Route = createFileRoute("/_admin/users/$userId")({
  component: () => {
    const { userId } = Route.useParams();
    return <UserDetailView userId={userId} />;
  },
});
