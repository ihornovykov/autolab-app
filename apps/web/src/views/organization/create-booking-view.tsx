import { useNavigate } from "@tanstack/react-router";
import { ArrowLeftIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import {
  CREATE_BOOKING_FORM_ID,
  useCreateBooking,
} from "@/features/booking/lib/use-create-booking";
import {
  VehicleBookingForm,
  VehicleBookingFormSkeleton,
} from "@/features/booking/ui/vehicle-booking-form";
import { VehicleSearchSelect } from "@/features/booking/ui/vehicle-search-select";
import { useSelectedOrganizationId } from "@/shared/lib/use-selected-organization-id";
import { PageContainer } from "@/shared/ui/page-container";
import { Button } from "@autolab/ui/components/button";
import { Skeleton } from "@autolab/ui/components/skeleton";

export const CreateBookingView = () => {
  const organizationId = useSelectedOrganizationId();
  const navigate = useNavigate();
  const [vehicleId, setVehicleId] = useState("");

  const { employees, services, isLoading, isPending, submitBooking } = useCreateBooking(
    organizationId!,
    () =>
      navigate({
        to: "/dashboard/organization/bookings",
        search: { organizationId: organizationId! },
      }),
  );

  if (!organizationId) return null;

  const canSubmit = !!vehicleId && employees.length > 0 && services.length > 0 && !isPending;

  const handleBack = () =>
    navigate({
      to: "/dashboard/organization/bookings",
      search: { organizationId },
    });

  return (
    <PageContainer className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Новий запис</h1>
          <p className="text-sm text-muted-foreground">
            Оберіть автомобіль і створіть запис на обслуговування
          </p>
        </div>
      </div>

      <div className="w-full max-w-3xl space-y-4">
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
          <>
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
              onSubmit={(values) => submitBooking(vehicleId, values)}
            />
          </>
        )}

        <div className="flex items-center justify-end gap-3 border-t border-border/60 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isPending || isLoading}
            onClick={handleBack}
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
      </div>
    </PageContainer>
  );
};
