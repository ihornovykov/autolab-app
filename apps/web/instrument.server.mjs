import * as Sentry from "@sentry/tanstackstart-react";
import { env } from "@autolab/env/server";

if (env.SENTRY_DSN) {
  Sentry.init({
    dsn: env.SENTRY_DSN,
    environment: env.SENTRY_ENVIRONMENT ?? "development",
    tracesSampleRate: 0,
    initialScope: {
      tags: { runtime: "server" },
    },
  });
}
