import { Outlet, createFileRoute } from "@tanstack/react-router";

const GuestLayout = () => <Outlet />;

export const Route = createFileRoute("/_guest")({
  component: GuestLayout,
});
