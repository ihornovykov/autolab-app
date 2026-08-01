import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { employeeRoleOptions } from "@/features/employee/lib/constants";
import type { EmployeeRole } from "@/features/employee/lib/types";
import { orpc } from "@/shared/api/orpc";
import { formatDate } from "@/shared/lib/date";
import { sheets } from "@/shared/stores/sheets";
import { RoleBadge } from "@/shared/ui/role-badge";
import { StatusLight } from "@/shared/ui/status-light";
import { Avatar } from "@autolab/ui/components/avatar";
import { Button } from "@autolab/ui/components/button";
import { Label } from "@autolab/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
} from "@autolab/ui/components/select";
import { Sheet } from "@autolab/ui/components/sheet";

type Employee = {
  id: string;
  role: EmployeeRole;
  isActive: boolean;
  startDate: Date;
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
};

type Props = {
  employee: Employee;
  organizationId: string;
};

export const EditEmployeeSheet = ({ employee, organizationId }: Props) => {
  const queryClient = useQueryClient();
  const [role, setRole] = useState(employee.role);
  const [isActive, setIsActive] = useState(employee.isActive);

  const updateMutation = useMutation(
    orpc.employee.updateEmployee.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.employee.key() });
        toast.success("Працівника оновлено");
        sheets.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити працівника");
      },
    }),
  );

  const isBusy = updateMutation.isPending;
  const hasChanges = role !== employee.role || isActive !== employee.isActive;

  const handleSave = () => {
    updateMutation.mutate({
      organizationId,
      employeeId: employee.id,
      role,
      isActive,
    });
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      title={employee.user.name}
      description="Редагування працівника"
      className="sm:max-w-md"
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={() => sheets.close()}
          >
            Закрити
          </Button>
          <Button
            type="button"
            loading={isBusy}
            disabled={!hasChanges || isBusy}
            onClick={handleSave}
          >
            Зберегти зміни
          </Button>
        </div>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <Avatar
          src={employee.user.image}
          fallback={employee.user.name}
          className="size-12"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{employee.user.name}</p>
          <p className="truncate text-xs text-muted-foreground">{employee.user.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <RoleBadge role={employee.role} />
            <StatusLight
              status={employee.isActive ? "ACTIVE" : "INACTIVE"}
              className={
                employee.isActive
                  ? "text-xs text-status-success"
                  : "text-xs text-muted-foreground"
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2 rounded-xl border border-border/60 p-4">
          <Label htmlFor="employee-role">Роль</Label>
          <p className="text-xs text-muted-foreground">
            Визначає рівень доступу працівника в організації
          </p>
          <Select
            value={role}
            onValueChange={(value) => {
              if (value) setRole(value as EmployeeRole);
            }}
            items={employeeRoleOptions}
          >
            <SelectTrigger id="employee-role">
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

        <div className="flex items-center justify-between rounded-xl border border-border/60 p-4">
          <div className="space-y-1">
            <Label htmlFor="employee-active">Активний</Label>
            <p className="text-xs text-muted-foreground">
              Неактивні працівники не мають доступу до організації
            </p>
          </div>
          <Switch
            checked={isActive}
            onCheckedChange={setIsActive}
            className="ml-4"
          />
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border/60 px-4 py-3 text-sm text-muted-foreground">
          <CalendarIcon className="size-4 shrink-0" />
          <span>Дата найму: {formatDate(employee.startDate, "iso")}</span>
        </div>
      </div>
    </Sheet>
  );
};
