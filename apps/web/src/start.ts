import { auth } from "@autolab/auth";
import {
  sentryGlobalFunctionMiddleware,
  sentryGlobalRequestMiddleware,
} from "@sentry/tanstackstart-react";
import { createMiddleware, createStart } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

import { setSentryUser } from "@/shared/lib/sentry";

const applySentryUser = async () => {
  try {
    const session = await auth.api.getSession({ headers: getRequest().headers });
    const user = session?.user;
    setSentryUser(user ? { id: user.id, email: user.email, username: user.name } : null);
  } catch {
    setSentryUser(null);
  }
};

const sentryRequestUserMiddleware = createMiddleware().server(async ({ next }) => {
  await applySentryUser();
  return next();
});

const sentryFunctionUserMiddleware = createMiddleware({ type: "function" }).server(async ({ next }) => {
  await applySentryUser();
  return next();
});

export const startInstance = createStart(() => ({
  requestMiddleware: [sentryGlobalRequestMiddleware, sentryRequestUserMiddleware],
  functionMiddleware: [sentryGlobalFunctionMiddleware, sentryFunctionUserMiddleware],
}));
