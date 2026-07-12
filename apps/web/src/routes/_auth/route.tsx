import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/features/auth/lib/get-user";

const AuthLayout = () => {
  return <Outlet />;
};

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
  beforeLoad: async () => {
    const session = await getUser();
    if (!session) {
      throw redirect({
        to: "/login",
      });
    }
    return { session };
  },
  loader: async ({ context }) => {
    if (!context.session) {
      throw redirect({
        to: "/login",
      });
    }
  },
});
