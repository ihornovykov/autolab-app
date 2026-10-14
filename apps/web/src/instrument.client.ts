import * as Sentry from "@sentry/tanstackstart-react";
import { env } from "@autolab/env/web";

const dsn = env.VITE_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    environment: env.VITE_SENTRY_ENVIRONMENT ?? "development",
    tracesSampleRate: 0,
    initialScope: {
      tags: { runtime: "browser" },
    },
  });
}
