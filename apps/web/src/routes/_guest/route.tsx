import { Outlet, createFileRoute } from "@tanstack/react-router";

import { Logo } from "@/shared/ui/logo";

const GuestLayout = () => (
  <div className="min-h-svh bg-background">
    <header className="sticky top-0 z-30 flex h-16 items-center justify-center border-b border-border/60 bg-background px-4">
      <Logo />
    </header>
    <main className="mx-auto w-full max-w-5xl px-4 py-6">
      <Outlet />
    </main>
  </div>
);

export const Route = createFileRoute("/_guest")({
  component: GuestLayout,
});
