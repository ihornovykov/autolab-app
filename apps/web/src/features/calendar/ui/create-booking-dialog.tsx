import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PlusIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { VehicleBookingForm, VehicleBookingFormSkeleton } from "@/features/booking/ui/vehicle-booking-form";
import { orpc } from "@/shared/api/orpc";
import { createSelectListInput } from "@/shared/lib/pagination";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";
import { Label } from "@autolab/ui/components/label";
import { Skeleton } from "@autolab/ui/components/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@autolab/ui/components/select";

const FORM_ID = "calendar-create-booking-form";

type Props = {
  organizationId: string;
  initialStartTime?: string;
};

export const CreateBookingDialog = ({ organizationId, initialStartTime }: Props) => {
  const queryClient = useQueryClient();
  const [vehicleId, setVehicleId] = useState("");

  const vehiclesQuery = useQuery({
    ...orpc.vehicle.listVehicles.queryOptions({ input: createSelectListInput(organizationId) }),
  });

  const employeesQuery = useQuery({
    ...orpc.employee.listEmployees.queryOptions({ input: createSelectListInput(organizationId) }),
  });

  const servicesQuery = useQuery({
    ...orpc.service.listServices.queryOptions({ input: createSelectListInput(organizationId) }),
  });

  const createMutation = useMutation(
    orpc.booking.createBooking.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
        toast.success("Запис створено");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося створити запис");
      },
    }),
  );

  const vehicles = vehiclesQuery.data?.items ?? [];

  const vehicleItems = useMemo(
    () =>
      vehicles.map((vehicle) => ({
        value: vehicle.id,
        label: [vehicle.make, vehicle.model, vehicle.licensePlate].filter(Boolean).join(" · "),
      })),
    [vehicles],
  );

  const employees = (employeesQuery.data?.items ?? [])
    .filter((employee) => employee.isActive)
    .map((employee) => ({
      id: employee.id,
      label: employee.user.name,
    }));

  const services = (servicesQuery.data?.items ?? []).map((service) => ({
    id: service.id,
    title: service.title,
    price: service.price,
    duration: service.duration,
  }));

  const isLoading =
    vehiclesQuery.isLoading || employeesQuery.isLoading || servicesQuery.isLoading;

  const canSubmit =
    !!vehicleId && employees.length > 0 && services.length > 0 && !createMutation.isPending;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Новий запис"
      description="Оберіть автомобіль і створіть запис на обслуговування"
      className="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending || isLoading}
            onClick={() => dialogs.close()}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            form={FORM_ID}
            icon={<PlusIcon />}
            loading={createMutation.isPending}
            disabled={!canSubmit || isLoading}
          >
            Створити
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
          </div>
          <VehicleBookingFormSkeleton />
        </div>
      ) : vehicles.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          Додайте автомобіль до організації, щоб створити запис.
        </p>
      ) : employees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          Додайте активного працівника, щоб створити запис.
        </p>
      ) : services.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          Додайте послуги до прайс-листа, щоб створити запис.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="calendar-booking-vehicle">Автомобіль *</Label>
            <Select
              value={vehicleId || null}
              onValueChange={(value) => setVehicleId(value ?? "")}
              items={vehicleItems}
            >
              <SelectTrigger id="calendar-booking-vehicle">
                <SelectValue placeholder="Оберіть автомобіль" />
              </SelectTrigger>
              <SelectContent>
                {vehicleItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <VehicleBookingForm
            formId={FORM_ID}
            organizationId={organizationId}
            employees={employees}
            services={services}
            initialValues={initialStartTime ? { startTime: initialStartTime } : undefined}
            onSubmit={(values) => {
              if (!vehicleId) return;

              createMutation.mutate({
                organizationId,
                vehicleId,
                employeeId: values.employeeId,
                serviceIds: values.serviceIds,
                startTime: dayjs(values.startTime).toISOString(),
                endTime: dayjs(values.endTime).toISOString(),
                allowsOvertime: values.allowsOvertime,
                notes: values.notes,
              });
            }}
          />
        </div>
      )}
    </Dialog>
  );
};
