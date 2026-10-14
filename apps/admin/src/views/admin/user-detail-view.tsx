import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@autolab/ui/components/card";
import { Skeleton } from "@autolab/ui/components/skeleton";
import { useQuery } from "@tanstack/react-query";
import { Building2Icon, IdCardIcon, LogOutIcon, PhoneIcon, ShieldIcon, UserRoundIcon } from "lucide-react";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { apiUrl, authClient, isPlatformAdmin } from "@/shared/lib/auth";
import { PageHeader } from "@/shared/ui/admin-shell";
import { IconTile } from "@/shared/ui/icon-tile";

type Props = { userId: string };

export const UserDetailView = ({ userId }: Props) => {
  const query = useQuery(orpc.admin.user.getUser.queryOptions({ input: { id: userId } }));
  const user = query.data as
    | {
        name: string;
        email: string;
        role: string;
        memberships: Array<{ organizationName: string; role: string }>;
        clientRecords: Array<{ organizationName: string; phone: string | null }>;
      }
    | undefined;

  const onRevoke = async () => {
    const result = await authClient.admin.revokeUserSessions({ userId });
    if (result.error) toast.error(result.error.message ?? "Не вдалося завершити сесії");
    else toast.success("Сесії завершено");
  };

  const onImpersonate = async () => {
    const result = await authClient.admin.impersonateUser({ userId });
    if (result.error) {
      toast.error(result.error.message ?? "Не вдалося увійти як користувач");
      return;
    }
    window.location.href = `${apiUrl}/dashboard`;
  };

  return (
    <div className="h-full min-h-0 overflow-auto">
      <PageHeader
        title={user?.name ?? "Користувач"}
        description={user?.email}
        children={
          user ? (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={onRevoke}>
                <LogOutIcon />
                Завершити сесії
              </Button>
              {isPlatformAdmin(user.role) ? null : (
                <Button type="button" onClick={onImpersonate}>
                  <UserRoundIcon />
                  Увійти як користувач
                </Button>
              )}
            </div>
          ) : null
        }
      />
      {query.isLoading ? <Skeleton className="h-40" /> : null}
      {user ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <IconTile icon={isPlatformAdmin(user.role) ? ShieldIcon : UserRoundIcon} />
                Роль
              </CardTitle>
              <Badge variant={isPlatformAdmin(user.role) ? "default" : "secondary"}>
                {isPlatformAdmin(user.role) ? "Адмін" : "Користувач"}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {user.memberships.length === 0 ? (
                <p className="text-muted-foreground">Немає членства в майстернях</p>
              ) : (
                user.memberships.map((membership) => (
                  <div key={`${membership.organizationName}-${membership.role}`} className="flex items-center gap-2">
                    <Building2Icon className="size-4 text-muted-foreground" />
                    <span>
                      {membership.organizationName} · {membership.role}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTile icon={IdCardIcon} />
                Картки клієнта
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {user.clientRecords.length === 0 ? (
                <p className="text-muted-foreground">Немає карток</p>
              ) : (
                user.clientRecords.map((record) => (
                  <div key={record.organizationName} className="flex items-center gap-2">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span>
                      {record.organizationName} · {record.phone ?? "без телефону"}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
};
