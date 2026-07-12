import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

type Props = {
  organizationId: string;
  vehicleId: string;
  make: string;
  model: string;
  onDeleted?: () => void;
};

export const DeleteOrganizationVehicleDialog = ({
  organizationId,
  vehicleId,
  make,
  model,
  onDeleted,
}: Props) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    orpc.vehicle.deleteVehicle.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.vehicle.key() });
        toast.success("Автомобіль видалено");
        onDeleted?.();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося видалити автомобіль");
      },
    }),
  );

  return (
    <ConfirmDialog
      title="Видалити автомобіль"
      description={`Ви впевнені, що хочете видалити ${make} ${model}? Цю дію неможливо скасувати.`}
      confirmLabel="Видалити"
      variant="destructive"
      onConfirm={async () => {
        await deleteMutation.mutateAsync({ organizationId, vehicleId });
      }}
    />
  );
};
