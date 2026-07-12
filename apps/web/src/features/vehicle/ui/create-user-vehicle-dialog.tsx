import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { UserVehicleForm } from "@/features/vehicle/ui/user-vehicle-form";
import { orpc } from "@/shared/api/orpc";
import { dialogs } from "@/shared/stores/dialogs";
import { Button } from "@autolab/ui/components/button";
import { Dialog } from "@autolab/ui/components/sheet";

const FORM_ID = "create-user-vehicle-form";

export const CreateUserVehicleDialog = () => {
  const queryClient = useQueryClient();

  const createMutation = useMutation(
    orpc.vehicle.createUserVehicle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.vehicle.key() });
        toast.success("Автомобіль додано");
        dialogs.close();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося додати автомобіль");
      },
    }),
  );

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && dialogs.close()}
      title="Додати авто"
      description="Заповніть дані вашого транспортного засобу"
      className="max-w-[700px]"
      footer={
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            disabled={createMutation.isPending}
            onClick={() => dialogs.close()}
          >
            Скасувати
          </Button>
          <Button type="submit" form={FORM_ID} loading={createMutation.isPending}>
            Зберегти
          </Button>
        </div>
      }
    >
      <UserVehicleForm
        formId={FORM_ID}
        onSubmit={(values) => createMutation.mutate(values)}
      />
    </Dialog>
  );
};
