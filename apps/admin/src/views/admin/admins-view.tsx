import { Button } from "@autolab/ui/components/button";
import { Input } from "@autolab/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@autolab/ui/components/table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { ShieldIcon } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { useTableState } from "@/shared/hooks/use-table-state";
import { authClient } from "@/shared/lib/auth";
import { NameCell, PAGE_SIZE, TableFrame } from "@/shared/ui/admin-table";
import { PageHeader } from "@/shared/ui/admin-shell";

export const AdminsView = () => {
  const queryClient = useQueryClient();
  const table = useTableState();
  const [email, setEmail] = useState("");
  const query = useQuery(
    orpc.admin.user.listUsers.queryOptions({
      input: {
        search: table.search || undefined,
        platformAdmin: true,
        page: table.page,
        pageSize: PAGE_SIZE,
        sort: "email",
        direction: "asc",
      },
    }),
  );

  const onGrant = async (event: FormEvent) => {
    event.preventDefault();
    const found = await queryClient.fetchQuery(
      orpc.admin.user.listUsers.queryOptions({
        input: { search: email, page: 1, pageSize: 5, sort: "email", direction: "asc" },
      }),
    );
    const user = found.items.find((item) => item.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      toast.error("Користувача з таким email немає");
      return;
    }
    const result = await authClient.admin.setRole({ userId: user.id, role: "admin" });
    if (result.error) toast.error(result.error.message ?? "Не вдалося надати доступ");
    else {
      setEmail("");
      toast.success("Адміністратора додано");
      void queryClient.invalidateQueries({ queryKey: orpc.admin.user.key() });
    }
  };

  const onRevoke = async (userId: string) => {
    const result = await authClient.admin.setRole({ userId, role: "user" });
    if (result.error) toast.error(result.error.message ?? "Не вдалося забрати доступ");
    else {
      toast.success("Доступ забрано");
      void queryClient.invalidateQueries({ queryKey: orpc.admin.user.key() });
    }
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PageHeader title="Адміни" description="Хто може відкрити цю консоль" />
      <TableFrame
        search={table.search}
        onSearch={table.onSearch}
        searchPlaceholder="Імʼя або email"
        page={table.page}
        totalPages={query.data?.totalPages ?? 0}
        total={query.data?.total ?? 0}
        onPageChange={table.setPage}
        isLoading={query.isLoading}
        toolbar={
          <form onSubmit={onGrant} className="flex items-center gap-2">
            <Input
              className="w-56"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="email для доступу"
              aria-label="Email існуючого користувача"
              required
            />
            <Button type="submit">Надати доступ</Button>
          </form>
        }
      >
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow>
              <TableHead>Імʼя</TableHead>
              <TableHead>Email</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.data?.items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                  Адміністраторів не знайдено
                </TableCell>
              </TableRow>
            ) : null}
            {query.data?.items.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <NameCell icon={ShieldIcon}>
                    <Link to="/users/$userId" params={{ userId: user.id }} className="font-medium hover:underline">
                      {user.name}
                    </Link>
                  </NameCell>
                </TableCell>
                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                <TableCell className="text-right">
                  <Button type="button" variant="outline" size="sm" onClick={() => onRevoke(user.id)}>
                    Забрати
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableFrame>
    </div>
  );
};
