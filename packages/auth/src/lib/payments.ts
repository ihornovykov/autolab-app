import { env } from "@autolab/env/server";
import { Polar } from "@polar-sh/sdk";

const POLAR_ENABLED = false;

export const isPolarEnabled = () =>
  POLAR_ENABLED && !!env.POLAR_ACCESS_TOKEN && !!env.POLAR_SUCCESS_URL;

export const polarClient = isPolarEnabled()
  ? new Polar({
      accessToken: env.POLAR_ACCESS_TOKEN!,
      server: env.NODE_ENV === "production" ? "production" : "sandbox",
    })
  : null;
