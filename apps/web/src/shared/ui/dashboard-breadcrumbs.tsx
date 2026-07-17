import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useRouterState } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import {
  buildDashboardBreadcrumbs,
  formatBookingBreadcrumbLabel,
  formatVehicleBreadcrumbLabel,
} from "@/shared/lib/dashboard-breadcrumbs";
import { useSelectedOrganizationId } from "@/shared/lib/use-selected-organization-id";
import { cn } from "@autolab/ui/lib/utils";

const getOrganizationSearch = (organizationId: string | null, requiresOrganizationSearch?: boolean) =>
  requiresOrganizationSearch && organizationId ? { organizationId } : undefined;

export const DashboardBreadcrumbs = () => {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const params = useParams({ strict: false });
  const organizationId = useSelectedOrganizationId();

  const bookingId = "bookingId" in params ? params.bookingId : undefined;
  const vehicleId = "vehicleId" in params ? params.vehicleId : undefined;

  const bookingQuery = useQuery({
    ...orpc.booking.getBookingById.queryOptions({
      input: {
        organizationId: organizationId ?? "",
        bookingId: bookingId ?? "",
      },
    }),
    enabled: !!organizationId && !!bookingId,
  });

  const vehicleQuery = useQuery({
    ...orpc.vehicle.getVehicleById.queryOptions({
      input: {
        organizationId: organizationId ?? "",
        vehicleId: vehicleId ?? "",
      },
    }),
    enabled: !!organizationId && !!vehicleId,
  });

  const crumbs = buildDashboardBreadcrumbs(pathname, {
    booking: bookingQuery.data ? formatBookingBreadcrumbLabel(bookingQuery.data) : undefined,
    vehicle: vehicleQuery.data ? formatVehicleBreadcrumbLabel(vehicleQuery.data) : undefined,
  });

  if (crumbs.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex min-w-0 items-center gap-1.5 text-sm text-muted-foreground sm:gap-2.5"
    >
      <ol className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          const search = getOrganizationSearch(organizationId, crumb.requiresOrganizationSearch);

          return (
            <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1.5 sm:gap-2.5">
              {index > 0 ? <ChevronRight className="size-3.5 shrink-0" aria-hidden /> : null}
              {crumb.to && !isLast ? (
                <Link
                  to={crumb.to}
                  search={search}
                  className="max-w-[96px] truncate transition-colors hover:text-foreground sm:max-w-[140px] md:max-w-[180px]"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? "page" : undefined}
                  className={cn(
                    "max-w-[120px] truncate sm:max-w-[180px] md:max-w-[220px]",
                    isLast && "font-medium text-foreground",
                  )}
                >
                  {crumb.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
