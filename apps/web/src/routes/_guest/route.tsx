import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthContext } from "@/features/auth/lib/utils";

const GuestAuthLayout = () => <Outlet />;

export const Route = createFileRoute("/_guest")({
  component: GuestAuthLayout,
  beforeLoad: async () => {
    const { session } = await resolveAuthContext();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
});
