const formatSingleError = (error: unknown): string | undefined => {
  if (!error) return undefined;
  if (typeof error === "string") return error;

  if (typeof error === "object") {
    const record = error as Record<string, unknown>;

    if (typeof record.message === "string") return record.message;

    if (Array.isArray(record.issues)) {
      const issueMessages = record.issues
        .map((issue) => {
          if (!issue || typeof issue !== "object") return undefined;
          const message = (issue as { message?: unknown }).message;
          return typeof message === "string" ? message : undefined;
        })
        .filter((message): message is string => Boolean(message));

      if (issueMessages.length) return issueMessages.join(", ");
    }
  }

  return undefined;
};

export const formatFieldErrors = (errors: readonly unknown[]): string | undefined => {
  const messages = errors
    .map(formatSingleError)
    .filter((message): message is string => Boolean(message));

  return messages.length ? messages.join(", ") : undefined;
};
