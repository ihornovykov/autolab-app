import { createFileRoute, redirect } from "@tanstack/react-router";

import { authClient, isPlatformAdmin } from "@/shared/lib/auth";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await authClient.getSession();
    const role = session.data?.user.role;
    if (session.data?.user && isPlatformAdmin(role) && !session.data.session.impersonatedBy) {
      throw redirect({ to: "/overview" });
    }
    throw redirect({ to: "/sign-in" });
  },
});
