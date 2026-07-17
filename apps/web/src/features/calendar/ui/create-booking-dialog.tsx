import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { VehicleBookingForm, VehicleBookingFormSkeleton } from "@/features/booking/ui/vehicle-booking-form";
import { VehicleSearchSelect } from "@/features/booking/ui/vehicle-search-select";
import { SERVICES_SELECT_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { createSelectListInput } from "@/shared/lib/pagination";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";
import { Skeleton } from "@autolab/ui/components/skeleton";

const FORM_ID = "calendar-create-booking-form";

type Props = {
  organizationId: string;
  initialStartTime?: string;
};

export const CreateBookingDialog = ({ organizationId, initialStartTime }: Props) => {
  const queryClient = useQueryClient();
  const [vehicleId, setVehicleId] = useState("");

  const employeesQuery = useQuery({
    ...orpc.employee.listEmployees.queryOptions({ input: createSelectListInput(organizationId) }),
  });

  const servicesQuery = useQuery({
    ...orpc.service.listServices.queryOptions({
      input: { organizationId, page: 1, pageSize: SERVICES_SELECT_PAGE_SIZE },
    }),
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

  const employees = (employeesQuery.data?.items ?? [])
    .filter((employee) => employee.isActive)
    .map((employee) => ({
      id: employee.id,
      label: employee.user.name,
    }));

  const services = (servicesQuery.data?.items ?? []).map((service) => ({
    id: service.id,
    title: service.title,
    description: service.description,
    category: service.category,
    price: service.price,
    duration: service.duration,
  }));

  const isLoading = employeesQuery.isLoading || servicesQuery.isLoading;

  const canSubmit =
    !!vehicleId && employees.length > 0 && services.length > 0 && !createMutation.isPending;

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Новий запис"
      description="Оберіть автомобіль і створіть запис на обслуговування"
      className="max-w-xl"
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
          <VehicleSearchSelect
            organizationId={organizationId}
            value={vehicleId}
            onValueChange={setVehicleId}
          />

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
                items: values.items,
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
