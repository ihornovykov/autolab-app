import { createFileRoute } from "@tanstack/react-router";

import { SignUpView } from "@/views/auth/sign-up-view";

export const Route = createFileRoute("/_auth/auth/sign-up")({
  component: SignUpView,
});
