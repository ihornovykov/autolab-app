import { createFileRoute } from "@tanstack/react-router";

import { SignUpView } from "@/views/auth/sign-up-view";

export const Route = createFileRoute("/_guest/auth/sign-up")({
  component: SignUpView,
});
