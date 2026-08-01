import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, PlusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { employeeRoleOptions } from "@/features/employee/lib/constants";
import type { EmployeeRole } from "@/features/employee/lib/types";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { Avatar } from "@autolab/ui/components/avatar";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";
import { Input } from "@autolab/ui/components/input";
import { Label } from "@autolab/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";
import { cn } from "@autolab/ui/lib/utils";

type Props = {
  organizationId: string;
};

type FoundUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

export const InviteEmployeeDialog = ({ organizationId }: Props) => {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<FoundUser | null>(null);
  const [role, setRole] = useState<EmployeeRole>("TECHNICIAN");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedQuery(query.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    setSelectedUser(null);
  }, [debouncedQuery]);

  const findUserQuery = useQuery({
    ...orpc.employee.findEmployeeByEmail.queryOptions({
      input: { organizationId, email: debouncedQuery },
    }),
    enabled: debouncedQuery.includes("@") && debouncedQuery.length > 5,
  });

  const inviteMutation = useMutation(
    orpc.employee.inviteEmployee.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.employee.key() });
        toast.success("Працівника додано");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Помилка при додаванні працівника");
      },
    }),
  );

  const foundUser = findUserQuery.data as FoundUser | null | undefined;

  const handleInvite = () => {
    if (!selectedUser) return;
    inviteMutation.mutate({
      organizationId,
      userId: selectedUser.id,
      role,
    });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Додати працівника"
      description="Знайдіть користувача за email та запросіть до організації."
      className="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => dialogs.close()}
            disabled={inviteMutation.isPending}
          >
            Скасувати
          </Button>
          <Button
            icon={<PlusIcon />}
            loading={inviteMutation.isPending}
            disabled={!selectedUser}
            onClick={handleInvite}
          >
            Додати
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="employee-search">Email</Label>
          <Input
            id="employee-search"
            placeholder="example@gmail.com"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Роль</Label>
          <Select
            value={role}
            onValueChange={(value) => {
              if (value) setRole(value as EmployeeRole);
            }}
            items={employeeRoleOptions}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {employeeRoleOptions.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {findUserQuery.isFetching ? (
          <div className="flex items-center justify-center rounded-md border py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : null}

        {foundUser && debouncedQuery.includes("@") ? (
          <button
            type="button"
            className={cn(
              "flex w-full cursor-pointer items-center gap-3 rounded-md border p-2 text-left transition-colors hover:bg-accent",
              selectedUser?.id === foundUser.id && "border-primary bg-accent/40",
            )}
            onClick={() => setSelectedUser(foundUser)}
          >
            <Avatar
              src={foundUser.image}
              fallback={foundUser.name}
              className="size-10"
            />
            <div className="min-w-0">
              <p className="truncate font-medium">{foundUser.name}</p>
              <p className="truncate text-sm text-muted-foreground">{foundUser.email}</p>
            </div>
          </button>
        ) : null}

        {!findUserQuery.isFetching && debouncedQuery.includes("@") && !foundUser ? (
          <p className="rounded-md border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
            Користувача не знайдено
          </p>
        ) : null}
      </div>
    </Dialog>
  );
};
