import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

type Props = {
  organizationId: string;
  bookingId: string;
  onDeleted?: () => void;
};

export const DeleteVehicleBookingDialog = ({
  organizationId,
  bookingId,
  onDeleted,
}: Props) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    orpc.booking.deleteBooking.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.booking.key() });
        toast.success("Запис видалено");
        onDeleted?.();
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося видалити запис");
      },
    }),
  );

  return (
    <ConfirmDialog
      title="Видалити запис"
      description="Ви впевнені, що хочете видалити цей запис? Цю дію неможливо скасувати."
      confirmLabel="Видалити"
      variant="destructive"
      onConfirm={async () => {
        await deleteMutation.mutateAsync({ organizationId, bookingId });
      }}
    />
  );
};
