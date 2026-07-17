import { createFileRoute } from "@tanstack/react-router";

import { ForgotPasswordView } from "@/views/auth/forgot-password-view";

export const Route = createFileRoute("/_guest/auth/forgot-password")({
  component: ForgotPasswordView,
});
