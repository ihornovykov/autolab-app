import { PlusIcon } from "lucide-react";

import {
  CREATE_BOOKING_FORM_ID,
  useCreateBooking,
} from "@/features/booking/hooks/use-create-booking";
import { VehicleBookingForm, VehicleBookingFormSkeleton } from "@/features/booking/ui/vehicle-booking-form";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

type Props = {
  organizationId: string;
  vehicleId: string;
};

export const CreateVehicleBookingDialog = ({ organizationId, vehicleId }: Props) => {
  const { employees, services, isLoading, isPending, submitBooking } = useCreateBooking(
    organizationId,
    () => dialogs.close(),
  );

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
            disabled={isPending || isLoading}
            onClick={() => dialogs.close()}
          >
            Скасувати
          </Button>
          <Button
            type="submit"
            form={CREATE_BOOKING_FORM_ID}
            icon={<PlusIcon />}
            loading={isPending}
            disabled={isLoading || employees.length === 0}
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
      ) : (
        <VehicleBookingForm
          formId={CREATE_BOOKING_FORM_ID}
          organizationId={organizationId}
          employees={employees}
          services={services}
          allowTotalPriceOverride
          onSubmit={(values) => submitBooking(vehicleId, values)}
        />
      )}
    </Dialog>
  );
};
