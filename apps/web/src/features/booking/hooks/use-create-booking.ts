import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { toast } from "sonner";

import { CREATE_BOOKING_FORM_ID } from "@/features/booking/lib/constants";
import type { VehicleBookingFormValues } from "@/features/booking/ui/vehicle-booking-form";
import { SERVICES_SELECT_PAGE_SIZE } from "@/features/service/lib/constants";

export { CREATE_BOOKING_FORM_ID };
import { orpc } from "@/shared/api/orpc";
import { createSelectListInput } from "@/shared/lib/pagination";

export const useCreateBooking = (organizationId: string, onSuccess?: () => void) => {
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
        onSuccess?.();
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
      role: employee.role,
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

  const submitBooking = (vehicleId: string, values: VehicleBookingFormValues) => {
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
      totalPrice: values.totalPrice,
    });
  };

  return {
    employees,
    services,
    isLoading,
    isPending: createMutation.isPending,
    submitBooking,
  };
};
