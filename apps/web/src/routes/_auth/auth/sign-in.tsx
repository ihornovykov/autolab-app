import { createFileRoute } from "@tanstack/react-router";

import { SignInView } from "@/views/auth/sign-in-view";

export const Route = createFileRoute("/_auth/auth/sign-in")({
  component: SignInView,
});
