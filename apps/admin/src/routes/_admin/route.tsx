import { createFileRoute, redirect } from "@tanstack/react-router";

import { AdminShell } from "@/shared/ui/admin-shell";
import { authClient, isPlatformAdmin } from "@/shared/lib/auth";

export const Route = createFileRoute("/_admin")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    if (!session.data?.user) throw redirect({ to: "/sign-in" });
    if (!isPlatformAdmin(session.data.user.role) || session.data.session.impersonatedBy) {
      throw redirect({ to: "/forbidden" });
    }
  },
  component: AdminShell,
});
