import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";

import { authClient } from "@/shared/lib/auth";
import { useSyncOrganizationSelection } from "@/shared/hooks/use-organization";
import { orpc } from "@/shared/api/orpc";
import { clearAuthContextCache } from "@/features/auth/lib/utils";
import { prefetchOrganizations } from "@/shared/lib/prefetch";
import { AppSidebar } from "@/shared/ui/app-sidebar";
import { DashboardTopbar } from "@/shared/ui/dashboard-topbar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { GlobalSearchDialog } from "@/features/search/ui/global-search-dialog";
import { useGlobalSearchShortcut } from "@/features/search/hooks/use-global-search-shortcut";
import { useGlobalSearchStore } from "@/features/search/lib/stores";
import { useSelectedOrganizationId } from "@/shared/hooks/use-organization";

const EMPTY_ORGANIZATIONS: Array<{ id: string; name: string; logo?: string | null; address?: string | null }> =
  [];

const DashboardLayout = () => {
  const { data: session } = authClient.useSession();
  const organizationsQuery = useQuery(orpc.organization.listMyOrganizations.queryOptions());
  const searchOpen = useGlobalSearchStore((state) => state.open);
  const setSearchOpen = useGlobalSearchStore((state) => state.setOpen);
  const organizationId = useSelectedOrganizationId();

  useGlobalSearchShortcut();

  const organizations = organizationsQuery.data ?? EMPTY_ORGANIZATIONS;
  useSyncOrganizationSelection(organizations);

  const onSignOut = () => {
    clearAuthContextCache();
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/auth/sign-in";
        },
      },
    });
  };

  if (!session?.user) return null;

  return (
    <SidebarProvider>
      <AppSidebar
        organizations={organizations}
        user={session.user}
        onSignOut={onSignOut}
      />
      <SidebarInset>
        <DashboardTopbar user={session.user} onSignOut={onSignOut} />
        <GlobalSearchDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          organizationId={organizationId}
        />
        <div className="flex min-h-0 flex-1 flex-col px-4 pb-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const Route = createFileRoute("/_app/dashboard")({
  loader: ({ context }) => prefetchOrganizations(context.queryClient),
  component: DashboardLayout,
});
