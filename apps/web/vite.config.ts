import { execFileSync } from "node:child_process";

import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { loadEnv } from "vite";
import { defineConfig } from "vite-plus";

const readSentryAuthToken = () => {
  try {
    const token = execFileSync("pnpm", ["exec", "sentry", "auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    return token || undefined;
  } catch {
    return undefined;
  }
};

const fileEnv = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const org = fileEnv.SENTRY_ORG;
const project = fileEnv.SENTRY_PROJECT;
const isBuild = process.argv.includes("build");
const authToken = isBuild ? readSentryAuthToken() : undefined;
const uploadSourceMaps = Boolean(org && project && authToken);

export default defineConfig({
  server: {
    port: 3001,
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro(),
    viteReact(),
    ...sentryTanstackStart({
      tunnelRoute: true,
      autoInstrumentMiddleware: false,
      org,
      project,
      authToken,
      sourcemaps: uploadSourceMaps ? undefined : { disable: true },
    }),
  ],
});
