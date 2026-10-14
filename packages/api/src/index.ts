import { ORPCError, os } from "@orpc/server";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }
  return next({
    context: {
      session: context.session,
    },
  });
});

export const protectedProcedure = publicProcedure.use(requireAuth);

const requireAdmin = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError("UNAUTHORIZED");
  }

  const sessionRecord = context.session.session as { impersonatedBy?: string | null };
  if (sessionRecord.impersonatedBy) {
    throw new ORPCError("FORBIDDEN", {
      message: "Impersonation sessions cannot call admin procedures",
    });
  }

  const role = (context.session.user as { role?: string | null }).role ?? "";
  const isAdmin = role
    .split(",")
    .map((value) => value.trim())
    .includes("admin");

  if (!isAdmin) {
    throw new ORPCError("FORBIDDEN");
  }

  return next({
    context: {
      session: context.session,
    },
  });
});

export const adminProcedure = publicProcedure.use(requireAdmin);

export type { AuthenticatedContext } from "./context";
export type { OrgContext } from "./lib/scope";

export const orgProcedure = protectedProcedure;
