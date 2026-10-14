import { readFileSync } from "node:fs";

import * as Sentry from "@sentry/tanstackstart-react";

const envFile = readFileSync(new URL("./.env", import.meta.url), "utf8");
const dsn = envFile.match(/^SENTRY_DSN=(.+)$/m)?.[1]?.trim();

if (!dsn) {
  console.error("SENTRY_DSN is missing");
  process.exit(1);
}

Sentry.init({
  dsn,
  environment: "development",
  tracesSampleRate: 0,
  debug: true,
});

const stamp = Date.now();

const serverEventId = Sentry.withScope((scope) => {
  scope.setTag("runtime", "server");
  return Sentry.captureException(new Error(`Sentry server verification ${stamp}`));
});

const browserEventId = Sentry.withScope((scope) => {
  scope.setTag("runtime", "browser");
  return Sentry.captureException(new Error(`Sentry browser verification ${stamp}`));
});

const client = Sentry.getClient();
console.log(
  JSON.stringify({
    enabled: client?.getOptions().enabled !== false,
    hasDsn: Boolean(client?.getDsn()),
    serverEventId,
    browserEventId,
  }),
);

const flushed = await Sentry.flush(10000);
console.log(flushed ? "flushed" : "flush timed out");

const dsnUrl = new URL(dsn);
const projectId = dsnUrl.pathname.slice(1);
const eventId = crypto.randomUUID().replaceAll("-", "");
const envelope = [
  JSON.stringify({ event_id: eventId, sent_at: new Date().toISOString() }),
  JSON.stringify({ type: "event" }),
  JSON.stringify({
    event_id: eventId,
    timestamp: Date.now() / 1000,
    platform: "node",
    level: "error",
    message: { formatted: `Sentry envelope verification ${stamp}` },
    tags: { runtime: "server" },
  }),
].join("\n");
const response = await fetch(
  `${dsnUrl.protocol}//${dsnUrl.host}/api/${projectId}/envelope/?sentry_key=${dsnUrl.username}`,
  {
    method: "POST",
    headers: { "content-type": "application/x-sentry-envelope" },
    body: envelope,
  },
);
console.log(`envelope_status=${response.status}`);
