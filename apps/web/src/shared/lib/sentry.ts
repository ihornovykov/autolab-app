import { isDefinedError, ORPCError } from "@orpc/client";
import * as Sentry from "@sentry/tanstackstart-react";

const isExpectedClientError = (error: unknown) =>
  error instanceof ORPCError && error.status < 500;

export const captureUnexpectedError = (error: unknown) => {
  if (isExpectedClientError(error)) return;
  Sentry.captureException(error);
};

export const captureUntypedError = (error: unknown) => {
  if (isDefinedError(error)) return;
  Sentry.captureException(error);
};

type SentryUser = {
  id: string;
  email?: string | null;
};

export const setSentryUser = (user: SentryUser | null) => {
  if (!user) {
    Sentry.setUser(null);
    return;
  }

  Sentry.setUser({
    id: user.id,
    email: user.email ?? undefined,
  });
};
