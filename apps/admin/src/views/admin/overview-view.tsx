import { Card, CardContent, CardHeader, CardTitle } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import {
  Building2Icon,
  CalendarIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  ShieldIcon,
  UserRoundIcon,
  UsersIcon,
  WrenchIcon,
  type LucideIcon,
} from "lucide-react";

import { orpc } from "@/shared/api/orpc";
import { PageHeader } from "@/shared/ui/admin-shell";
import { IconTile } from "@/shared/ui/icon-tile";

const bookingStatuses = {
  PENDING: { label: "Очікує", icon: ClockIcon },
  IN_PROGRESS: { label: "В роботі", icon: WrenchIcon },
  COMPLETED: { label: "Виконано", icon: CircleCheckIcon },
  CANCELLED: { label: "Скасовано", icon: CircleXIcon },
} as const;

export const OverviewView = () => {
  const query = useQuery(orpc.admin.overview.getOverview.queryOptions({ input: {} }));
  const organizations = useQuery(
    orpc.admin.organization.listOrganizations.queryOptions({
      input: { page: 1, pageSize: 5, sort: "createdAt", direction: "desc" },
    }),
  );
  const users = useQuery(
    orpc.admin.user.listUsers.queryOptions({
      input: { page: 1, pageSize: 5, sort: "createdAt", direction: "desc" },
    }),
  );
  const data = query.data;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Огляд" description="Що відбувається на платформі за останні 7 днів" />
      <div className="min-h-0 flex-1 overflow-auto pb-2">
        {query.isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        ) : null}
        {query.error ? <p className="text-sm text-destructive">{query.error.message}</p> : null}
        {data ? (
          <div className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Stat
                icon={Building2Icon}
                label="Організації"
                value={data.organizations.total}
                hint={`${data.organizations.createdInRange} нових за період`}
                to="/organizations"
              />
              <Stat
                icon={UsersIcon}
                label="Користувачі"
                value={data.users.total}
                hint={`${data.users.createdInRange} нових · ${data.users.platformAdmins} адмінів`}
                to="/users"
              />
              <Stat
                icon={CalendarIcon}
                label="Записи"
                value={data.bookings.totalInRange}
                hint={`${data.bookings.completedRevenueInRange} грн виконано`}
              />
            </div>
            <Card>
              <CardHeader>
                <CardTitle>Записи за статусом</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-4">
                {Object.entries(data.bookings.byStatus).map(([status, value]) => {
                  const meta = bookingStatuses[status as keyof typeof bookingStatuses];
                  const StatusIcon = meta.icon;
                  return (
                    <div key={status} className="rounded-lg bg-muted/40 px-3 py-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <StatusIcon className="size-4 shrink-0" />
                        <span>{meta.label}</span>
                      </div>
                      <div className="mt-1 text-2xl font-semibold">{value}</div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Нові майстерні</CardTitle>
                  <Link to="/organizations" className="text-sm text-muted-foreground hover:text-foreground">
                    Усі
                  </Link>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {organizations.data?.items.map((organization) => (
                    <Link
                      key={organization.id}
                      to="/organizations/$organizationId"
                      params={{ organizationId: organization.id }}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                    >
                      <IconTile icon={Building2Icon} />
                      <span className="min-w-0 flex-1 font-medium">{organization.name}</span>
                      <span className="text-muted-foreground">{organization.employeeCount} працівників</span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle>Нові користувачі</CardTitle>
                  <Link to="/users" className="text-sm text-muted-foreground hover:text-foreground">
                    Усі
                  </Link>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  {users.data?.items.map((user) => (
                    <Link
                      key={user.id}
                      to="/users/$userId"
                      params={{ userId: user.id }}
                      className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50"
                    >
                      <IconTile icon={user.isPlatformAdmin ? ShieldIcon : UserRoundIcon} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{user.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{user.email}</span>
                      </span>
                      <span className="shrink-0 text-muted-foreground">
                        {user.isPlatformAdmin ? "Адмін" : "Користувач"}
                      </span>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

type StatProps = {
  icon: LucideIcon;
  label: string;
  value: number;
  hint: string;
  to?: "/organizations" | "/users";
};

const Stat = ({ icon, label, value, hint, to }: StatProps) => {
  const card = (
    <Card className={to ? "h-full transition-colors hover:bg-muted/30" : undefined}>
      <CardHeader className="flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <IconTile icon={icon} />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      </CardContent>
    </Card>
  );
  if (!to) return card;
  return <Link to={to}>{card}</Link>;
};
