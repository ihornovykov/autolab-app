import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    POLAR_ACCESS_TOKEN: z.string().min(1).optional(),
    POLAR_SUCCESS_URL: z.url().optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    AUTORIA_API_URL: z.url().optional(),
    AUTORIA_API_KEY: z.string().min(1).optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

export const isGoogleAuthEnabled = () => !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET;
