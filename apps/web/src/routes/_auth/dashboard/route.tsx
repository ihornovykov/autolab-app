import { useQuery } from "@tanstack/react-query";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { authClient } from "@/shared/lib/auth-client";
import { useSyncOrganizationSelection } from "@/shared/lib/use-sync-organization-selection";
import { orpc } from "@/shared/api/orpc";
import { ensureOrganizations } from "@/shared/lib/route-prefetch";
import { AppSidebar } from "@/shared/ui/app-sidebar";
import { DashboardTopbar } from "@/shared/ui/dashboard-topbar";
import { SidebarInset, SidebarProvider } from "@/shared/ui/sidebar";
import { GlobalSearchDialog } from "@/features/search/ui/global-search-dialog";
import { useGlobalSearchShortcut } from "@/features/search/lib/use-global-search-shortcut";
import { useGlobalSearchStore } from "@/features/search/model/global-search-store";
import { useSelectedOrganizationId } from "@/shared/lib/use-selected-organization-id";

const searchSchema = z.object({
  organizationId: z.string().optional(),
});

const EMPTY_ORGANIZATIONS: Array<{ id: string; name: string; logo?: string | null; address?: string | null }> =
  [];

const DashboardLayout = () => {
  const { data: session } = authClient.useSession();
  const search = Route.useSearch();
  const organizationsQuery = useQuery(orpc.organization.listMyOrganizations.queryOptions());
  const searchOpen = useGlobalSearchStore((state) => state.open);
  const setSearchOpen = useGlobalSearchStore((state) => state.setOpen);
  const organizationId = useSelectedOrganizationId();

  useGlobalSearchShortcut();

  const organizations = organizationsQuery.data ?? EMPTY_ORGANIZATIONS;
  useSyncOrganizationSelection(organizations, search.organizationId);

  const onSignOut = () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/login";
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
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-6">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <Outlet />
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export const Route = createFileRoute("/_auth/dashboard")({
  validateSearch: searchSchema,
  loader: ({ context }) => ensureOrganizations(context.queryClient),
  component: DashboardLayout,
});
