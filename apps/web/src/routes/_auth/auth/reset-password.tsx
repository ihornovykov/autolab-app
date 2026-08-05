import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { ResetPasswordView } from "@/views/auth/reset-password-view";

const searchSchema = z.object({
  token: z.string().optional(),
  error: z.string().optional(),
});

const ResetPasswordPage = () => {
  const search = Route.useSearch();

  return <ResetPasswordView token={search.token} error={search.error} />;
};

export const Route = createFileRoute("/_auth/auth/reset-password")({
  validateSearch: searchSchema,
  component: ResetPasswordPage,
});
