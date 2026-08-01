import { createFileRoute, redirect } from "@tanstack/react-router";

import { resolveAuthContext } from "@/features/auth/lib/utils";

export const Route = createFileRoute("/")({
  beforeLoad: async () => {
    const { session } = await resolveAuthContext();
    throw redirect({ to: session ? "/dashboard" : "/auth/sign-in" });
  },
});
