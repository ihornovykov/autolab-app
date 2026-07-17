import { createFileRoute, redirect } from "@tanstack/react-router";

import { getUser } from "@/features/auth/lib/get-user";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const session = await getUser();
    throw redirect({ to: session ? "/dashboard" : "/auth/sign-in" });
  },
});
