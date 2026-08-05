import { auth } from "@autolab/auth";

type Request = {
  headers: Headers;
};

export async function createContext({ req }: { req: Request }) {
  const session = await auth.api.getSession({
    headers: req.headers,
  });
  return {
    auth: null,
    session,
    headers: req.headers,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;

export type AuthenticatedContext = Context & {
  session: NonNullable<Context["session"]>;
};
