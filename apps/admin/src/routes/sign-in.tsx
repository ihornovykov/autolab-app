import { createFileRoute } from "@tanstack/react-router";

import { SignInView } from "@/views/admin/sign-in-view";

export const Route = createFileRoute("/sign-in")({
  component: SignInView,
});
