import { createFileRoute } from "@tanstack/react-router";

import { SuccessView } from "@/views/auth/success-view";

export const Route = createFileRoute("/success")({
  component: SuccessView,
  validateSearch: (search) => ({
    checkout_id: search.checkout_id as string,
  }),
});
