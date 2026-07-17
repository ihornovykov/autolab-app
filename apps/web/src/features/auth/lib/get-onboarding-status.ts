import { createServerFn } from "@tanstack/react-start";

import { client } from "@/shared/api/orpc";

export const getOnboardingStatus = createServerFn({ method: "GET" }).handler(async () =>
  client.profile.getOnboardingStatus(),
);
