import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const envDir = resolve(dirname(fileURLToPath(import.meta.url)), "../../../apps/web");
dotenv.config({ path: resolve(envDir, ".env") });

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    BETTER_AUTH_SECRET: z.string().min(32),
    BOOKING_SHARE_SECRET: z.string().min(32).optional(),
    BETTER_AUTH_URL: z.url(),
    CORS_ORIGIN: z.url(),
    POLAR_ACCESS_TOKEN: z.string().min(1).optional(),
    POLAR_SUCCESS_URL: z.url().optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).optional(),
    GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
    AUTORIA_API_URL: z.url().optional(),
    AUTORIA_API_KEY: z.string().min(1).optional(),
    SMTP_HOST: z.string().trim().min(1).optional(),
    SMTP_PORT: z.coerce.number().int().positive().default(587),
    SMTP_USERNAME: z
      .string()
      .trim()
      .min(1)
      .transform((value) => value.toLowerCase())
      .optional(),
    SMTP_PASSWORD: z
      .string()
      .trim()
      .transform((value) => value.replace(/\s+/g, ""))
      .pipe(z.string().min(1))
      .optional(),
    SMTP_FROM: z.string().trim().min(1).optional(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    ADMIN_ORIGIN: z.url().optional(),
    PLATFORM_ADMIN_EMAILS: z.string().optional(),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ENVIRONMENT: z.string().optional(),
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});

export const isGoogleAuthEnabled = () => !!env.GOOGLE_CLIENT_ID && !!env.GOOGLE_CLIENT_SECRET;

export const isSmtpEnabled = () =>
  !!env.SMTP_HOST && !!env.SMTP_USERNAME && !!env.SMTP_PASSWORD;
