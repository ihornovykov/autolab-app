import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

import { VehicleBookingForm, VehicleBookingFormSkeleton } from "@/features/booking/ui/vehicle-booking-form";
import { SERVICES_SELECT_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { createSelectListInput } from "@/shared/lib/pagination";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

const FORM_ID = "create-vehicle-booking-form";

type Props = {
  organizationId: string;
  vehicleId: string;
};

export const CreateVehicleBookingDialog = ({ organizationId, vehicleId }: Props) => {
  const queryClient = useQueryClient();

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

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Новий запис"
      description="Створіть запис на обслуговування для цього автомобіля"
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
            disabled={isLoading || employees.length === 0 || services.length === 0}
          >
            Створити
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <VehicleBookingFormSkeleton />
      ) : employees.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          Додайте активного працівника, щоб створити запис.
        </p>
      ) : services.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 px-4 py-8 text-center text-sm text-muted-foreground">
          Додайте послуги до прайс-листа, щоб створити запис.
        </p>
      ) : (
        <VehicleBookingForm
          formId={FORM_ID}
          organizationId={organizationId}
          employees={employees}
          services={services}
          onSubmit={(values) => {
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
      )}
    </Dialog>
  );
};
