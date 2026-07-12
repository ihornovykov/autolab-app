import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_SIMPLE_ICONS_URL: z.url().optional(),
  },
  runtimeEnv: (import.meta as any).env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

export const getSimpleIconsUrl = () => env.VITE_SIMPLE_ICONS_URL ?? "https://cdn.simpleicons.org";
