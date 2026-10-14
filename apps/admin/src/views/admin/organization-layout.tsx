import { Skeleton } from "@autolab/ui/components/skeleton";
import { cn } from "@autolab/ui/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import { CalendarIcon, CarIcon, LayoutDashboardIcon, UserRoundIcon, UsersIcon, WrenchIcon } from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import { OrganizationHeaderActions } from "@/views/admin/organization-forms";

const tabs = [
  { to: "/organizations/$organizationId", label: "Огляд", exact: true, icon: LayoutDashboardIcon },
  { to: "/organizations/$organizationId/employees", label: "Працівники", exact: false, icon: UsersIcon },
  { to: "/organizations/$organizationId/bookings", label: "Записи", exact: false, icon: CalendarIcon },
  { to: "/organizations/$organizationId/vehicles", label: "Авто", exact: false, icon: CarIcon },
  { to: "/organizations/$organizationId/clients", label: "Клієнти", exact: false, icon: UserRoundIcon },
  { to: "/organizations/$organizationId/services", label: "Послуги", exact: false, icon: WrenchIcon },
] as const;

type Props = { organizationId: string };

export const OrganizationLayout = ({ organizationId }: Props) => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const query = useQuery(
    orpc.admin.organization.getOrganization.queryOptions({ input: { id: organizationId } }),
  );
  const organization = query.data as
    | { name: string; slug: string; address: string | null; phone: string | null }
    | undefined;
  const base = `/organizations/${organizationId}`.replace(/\/$/, "");

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-4 shrink-0">
        {query.isLoading ? <Skeleton className="mb-2 h-8 w-48" /> : null}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight">
              {organization?.name ?? "Організація"}
            </h1>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {[organization?.slug, organization?.address, organization?.phone].filter(Boolean).join(" · ")}
            </p>
          </div>
          <OrganizationHeaderActions organizationId={organizationId} />
        </div>
        <div className="mt-4 flex gap-1 overflow-x-auto border-b border-border">
          {tabs.map((tab) => {
            const href = tab.exact ? base : `${base}/${tab.to.split("/").at(-1)}`;
            const current = pathname.replace(/\/$/, "");
            const active = tab.exact ? current === base : current.startsWith(href);
            const Icon = tab.icon;
            return (
              <Link
                key={tab.label}
                to={tab.to}
                params={{ organizationId }}
                className={cn(
                  "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground",
                  active && "border-primary font-medium text-foreground",
                )}
              >
                <Icon className="size-4" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </div>
    </div>
  );
};
