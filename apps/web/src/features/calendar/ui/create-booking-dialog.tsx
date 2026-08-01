import { PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  CREATE_BOOKING_FORM_ID,
  useCreateBooking,
} from "@/features/booking/hooks/use-create-booking";
import { VehicleBookingForm, VehicleBookingFormSkeleton } from "@/features/booking/ui/vehicle-booking-form";
import { VehicleSearchSelect } from "@/features/booking/ui/vehicle-search-select";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";
import { Skeleton } from "@autolab/ui/components/skeleton";

type Props = {
  organizationId: string;
  initialStartTime?: string;
};

export const CreateBookingDialog = ({ organizationId, initialStartTime }: Props) => {
  const [vehicleId, setVehicleId] = useState("");
  const { employees, services, isLoading, isPending, submitBooking } = useCreateBooking(
    organizationId,
    () => dialogs.close(),
  );

  const canSubmit =
    !!vehicleId && employees.length > 0 && services.length > 0 && !isPending;

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
            formId={CREATE_BOOKING_FORM_ID}
            organizationId={organizationId}
            employees={employees}
            services={services}
            allowTotalPriceOverride
            initialValues={initialStartTime ? { startTime: initialStartTime } : undefined}
            onSubmit={(values) => submitBooking(vehicleId, values)}
          />
        </div>
      )}
    </Dialog>
  );
};
