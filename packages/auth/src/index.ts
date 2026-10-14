import { createDb } from "@autolab/db";
import * as schema from "@autolab/db/schema/auth";
import { profiles } from "@autolab/db/schema/profile";
import { env, isGoogleAuthEnabled } from "@autolab/env/server";
import { polar, checkout, portal } from "@polar-sh/better-auth";
import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin } from "better-auth/plugins";
import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { and, count, eq, ne } from "drizzle-orm";

import { isPolarEnabled, polarClient } from "./lib/payments";
import { sendResetPasswordEmail, sendVerificationEmail } from "@autolab/email";

const createId = () => crypto.randomUUID();

const ac = createAccessControl(defaultStatements);

const platformAdmin = ac.newRole({
  user: ["list", "get", "set-role", "impersonate"],
  session: ["list", "revoke"],
});

const sharedCookieDomain = () => {
  if (!env.ADMIN_ORIGIN) return undefined;
  const shopHost = new URL(env.CORS_ORIGIN).hostname;
  const adminHost = new URL(env.ADMIN_ORIGIN).hostname;
  if (shopHost === "localhost" || adminHost === "localhost") return undefined;
  const shopParts = shopHost.split(".");
  const adminParts = adminHost.split(".");
  if (shopParts.length < 2 || adminParts.length < 2) return undefined;
  const parent = shopParts.slice(-2).join(".");
  if (parent !== adminParts.slice(-2).join(".")) return undefined;
  return parent;
};

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
    trustedOrigins: [env.CORS_ORIGIN, ...(env.ADMIN_ORIGIN ? [env.ADMIN_ORIGIN] : [])],
    advanced: sharedCookieDomain()
      ? { crossSubDomainCookies: { enabled: true, domain: sharedCookieDomain() } }
      : undefined,
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        await sendResetPasswordEmail({
          to: user.email,
          resetUrl: url,
          userName: user.name,
        });
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        await sendVerificationEmail({
          to: user.email,
          verifyUrl: url,
          userName: user.name,
        });
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
    account: {
      accountLinking: {
        enabled: true,
        trustedProviders: isGoogleAuthEnabled() ? ["google"] : [],
        allowDifferentEmails: true,
      },
    },
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
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        const impersonatedBy = ctx.context.session?.session.impersonatedBy;
        const credentialPaths = ["/change-password", "/delete-user", "/unlink-account"];
        if (impersonatedBy && credentialPaths.some((path) => ctx.path.startsWith(path))) {
          throw new APIError("FORBIDDEN", {
            message: "Credential changes are blocked while impersonating",
          });
        }

        if (ctx.path !== "/admin/set-role") return;
        const body = ctx.body as { userId?: string; role?: string };
        if (body.role !== "user" || !body.userId) return;
        const actorId = ctx.context.session?.user.id;
        if (actorId && actorId === body.userId) {
          throw new APIError("FORBIDDEN", { message: "You cannot demote yourself" });
        }
        const [remaining] = await db
          .select({ value: count() })
          .from(schema.users)
          .where(and(eq(schema.users.role, "admin"), ne(schema.users.id, body.userId)));
        if ((remaining?.value ?? 0) === 0) {
          throw new APIError("FORBIDDEN", { message: "The last platform admin cannot be demoted" });
        }
      }),
    },
    plugins: [
      admin({
        defaultRole: "user",
        adminRoles: ["admin"],
        impersonationSessionDuration: 60 * 60,
        ac,
        roles: {
          admin: platformAdmin,
          user: ac.newRole({ user: [], session: [] }),
        },
      }),
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
