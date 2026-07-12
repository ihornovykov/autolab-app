import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { UserVehicleForm } from "@/features/vehicle/ui/user-vehicle-form";
import { DeleteUserVehicleDialog } from "@/features/vehicle/ui/delete-user-vehicle-dialog";
import { VehicleMakeIcon } from "@/features/vehicle/ui/vehicle-make-icon";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { sheets } from "@/shared/stores/sheets";
import { Button } from "@autolab/ui/components/button";
import { Sheet } from "@autolab/ui/components/sheet";

const FORM_ID = "edit-user-vehicle-form";

type Vehicle = {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate?: string | null;
  vin?: string | null;
  bodyStyle?: string | null;
  engine?: string | null;
  engineVolume?: number | null;
};

type Props = {
  vehicle: Vehicle;
};

export const EditUserVehicleSheet = ({ vehicle }: Props) => {
  const queryClient = useQueryClient();

  const updateMutation = useMutation(
    orpc.vehicle.updateUserVehicle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.vehicle.key() });
        toast.success("Автомобіль оновлено");
        sheets.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося оновити автомобіль");
      },
    }),
  );

  const handleDeleteClick = () => {
    sheets.close();
    dialogs.open(
      <DeleteUserVehicleDialog
        vehicleId={vehicle.id}
        make={vehicle.make}
        model={vehicle.model}
      />,
    );
  };

  const isBusy = updateMutation.isPending;

  return (
    <Sheet
      open
      onOpenChange={(open) => !open && sheets.close()}
      title={`${vehicle.make} ${vehicle.model}`}
      description="Редагування транспортного засобу"
      className="sm:max-w-xl"
      footer={
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            size="default"
            disabled={isBusy}
            onClick={handleDeleteClick}
          >
            Видалити
          </Button>
          <div className="flex gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="default"
              disabled={isBusy}
              onClick={() => sheets.close()}
            >
              Закрити
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              size="default"
              loading={updateMutation.isPending}
            >
              Зберегти зміни
            </Button>
          </div>
        </div>
      }
    >
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-border/60 bg-muted/20 p-3">
        <VehicleMakeIcon make={vehicle.make} className="size-12" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {vehicle.make} {vehicle.model}
          </p>
          <p className="text-xs text-muted-foreground">{vehicle.year} рік</p>
        </div>
      </div>

      <UserVehicleForm
        formId={FORM_ID}
        initialVehicle={vehicle}
        onSubmit={(values) =>
          updateMutation.mutate({
            vehicleId: vehicle.id,
            ...values,
          })
        }
      />
    </Sheet>
  );
};
