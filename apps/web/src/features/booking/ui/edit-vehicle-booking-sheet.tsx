import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { toast } from "sonner";

import { DeleteVehicleBookingDialog } from "@/features/booking/ui/delete-vehicle-booking-dialog";
import {
  type VehicleBookingFormValues,
  VehicleBookingForm,
  VehicleBookingFormSkeleton,
} from "@/features/booking/ui/vehicle-booking-form";
import { type VehicleBookingHistoryItem } from "@/features/booking/lib/types";
import { SERVICES_SELECT_PAGE_SIZE } from "@/features/service/lib/constants";
import { orpc } from "@/shared/api/orpc";
import { createSelectListInput } from "@/shared/lib/pagination";
import { formatDate } from "@/shared/lib/date";
import { formatPrice } from "@/shared/lib/money";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { StatusLight } from "@/shared/ui/status-light";
import { Badge } from "@autolab/ui/components/badge";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";

const FORM_ID = "edit-vehicle-booking-form";

type Props = {
  booking: VehicleBookingHistoryItem;
  organizationId: string;
};

export const EditVehicleBookingSheet = ({ booking, organizationId }: Props) => {
  const queryClient = useQueryClient();

  const employeesQuery = useQuery({
    ...orpc.employee.listEmployees.queryOptions({ input: createSelectListInput(organizationId) }),
  });

  const servicesQuery = useQuery({
    ...orpc.service.listServices.queryOptions({
      input: { organizationId, page: 1, pageSize: SERVICES_SELECT_PAGE_SIZE },
    }),
  });

  const updateMutation = useMutation(
    orpc.booking.updateBooking.mutationOptions({
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити запис");
      },
    }),
  );

  const updateStatusMutation = useMutation(
    orpc.booking.updateBookingStatus.mutationOptions({
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити статус");
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
  const isBusy = updateMutation.isPending || updateStatusMutation.isPending;

  const handleDeleteClick = () => {
    sheets.close();
    dialogs.open(
      <DeleteVehicleBookingDialog organizationId={organizationId} bookingId={booking.id} />,
    );
  };

  const handleSubmit = async (values: VehicleBookingFormValues) => {
    await updateMutation.mutateAsync({
      organizationId,
      bookingId: booking.id,
      employeeId: values.employeeId,
      items: values.items,
      startTime: dayjs(values.startTime).toISOString(),
      endTime: dayjs(values.endTime).toISOString(),
      allowsOvertime: values.allowsOvertime,
      notes: values.notes,
      totalPrice: values.totalPrice,
    });

    if (values.status !== booking.status) {
      await updateStatusMutation.mutateAsync({
        organizationId,
        bookingId: booking.id,
        status: values.status,
      });
    }

    queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
    toast.success("Запис оновлено");
    sheets.close();
  };

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      title="Редагування запису"
      description="Змініть деталі обслуговування або статус"
      className="sm:max-w-lg"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button type="button" variant="destructive" disabled={isBusy} onClick={handleDeleteClick}>
            Видалити
          </Button>
          <div className="flex gap-2 sm:justify-end">
            <Button type="button" variant="outline" disabled={isBusy} onClick={() => sheets.close()}>
              Закрити
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              loading={isBusy}
              disabled={isLoading || employees.length === 0 || services.length === 0}
            >
              Зберегти зміни
            </Button>
          </div>
        </div>
      }
    >
      <div className="mb-5 space-y-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <div className="flex items-start justify-between gap-3">
          <StatusLight status={booking.status} className="text-sm font-medium" />
          <p className="shrink-0 text-sm font-semibold tabular-nums">
            {formatPrice(booking.totalPrice)}
          </p>
        </div>
        <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="size-4 shrink-0 opacity-70" />
          {formatDate(booking.startTime)}
        </p>
        {booking.services?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {booking.services.map((service) => (
              <Badge key={service.id} variant="outline" className="font-normal">
                {service.title}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>

      {isLoading ? (
        <VehicleBookingFormSkeleton />
      ) : (
        <VehicleBookingForm
          formId={FORM_ID}
          organizationId={organizationId}
          showStatus
          allowTotalPriceOverride
          employees={employees}
          services={services}
          initialValues={{
            employeeId: booking.employeeId,
            items:
              booking.services?.map((service) => ({
                serviceId: service.id,
                quantity: service.quantity ?? 1,
                unitPrice: service.unitPrice ?? service.price ?? "0",
              })) ?? [],
            startTime: dayjs(booking.startTime).format("YYYY-MM-DDTHH:mm"),
            endTime: dayjs(booking.endTime).format("YYYY-MM-DDTHH:mm"),
            allowsOvertime: booking.allowsOvertime ?? false,
            notes: booking.notes ?? "",
            status: booking.status,
            totalPrice: booking.totalPrice,
          }}
          onSubmit={handleSubmit}
        />
      )}
    </Sheet>
  );
};
