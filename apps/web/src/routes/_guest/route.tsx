import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/features/auth/lib/get-user";

const GuestAuthLayout = () => <Outlet />;

export const Route = createFileRoute("/_guest")({
  component: GuestAuthLayout,
  beforeLoad: async () => {
    const session = await getUser();
    if (session) {
      throw redirect({ to: "/dashboard" });
    }
  },
});
