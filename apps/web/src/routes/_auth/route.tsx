import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthContext } from "@/features/auth/lib/utils";

const AuthLayout = () => <Outlet />;

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async () => {
    const { session } = await resolveAuthContext();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
});
