import { createDb } from "@autolab/db";
import * as schema from "@autolab/db/schema/auth";
import { profiles } from "@autolab/db/schema/profile";
import { env, isGoogleAuthEnabled } from "@autolab/env/server";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { tanstackStartCookies } from "better-auth/tanstack-start";

import { isPolarEnabled, polarClient } from "./lib/payments";

const createId = () => crypto.randomUUID();

export function createAuth() {
  const db = createDb();

  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.users,
        session: schema.sessions,
        account: schema.accounts,
        verification: schema.verifications,
      },
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        console.info(`[auth] Password reset for ${user.email}: ${url}`);
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        console.info(`[auth] Verification email for ${user.email}: ${url}`);
      },
    },
    socialProviders: isGoogleAuthEnabled()
      ? {
          google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
          },
        }
      : undefined,
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            await db
              .insert(profiles)
              .values({ id: createId(), userId: user.id })
              .onConflictDoNothing();
          },
        },
      },
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    plugins: [
      ...(isPolarEnabled() && polarClient
        ? [
            polar({
              client: polarClient,
              createCustomerOnSignUp: true,
              enableCustomerPortal: true,
              use: [
                checkout({
                  products: [{ productId: "your-product-id", slug: "pro" }],
                  successUrl: env.POLAR_SUCCESS_URL!,
                  authenticatedUsersOnly: true,
                }),
                portal(),
              ],
            }),
          ]
        : []),
      tanstackStartCookies(),
    ],
  });
}

export const auth = createAuth();
