import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { orpc } from "@/shared/api/orpc";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

type Props = {
  organizationId: string;
  name: string;
  onDeleted?: () => void;
};

export const DeleteOrganizationDialog = ({
  organizationId,
  name,
  onDeleted,
}: Props) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation(
    orpc.organization.deleteOrganization.mutationOptions({
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: orpc.organization.key() });
        onDeleted?.();
        toast.success("Організацію видалено");
      },
      onError: (error) => {
        toast.error(error.message ?? "Не вдалося видалити організацію");
      },
    }),
  );

  return (
    <ConfirmDialog
      title="Видалити організацію"
      description={`Ви впевнені, що хочете видалити ${name}? Усі пов’язані дані буде видалено. Цю дію неможливо скасувати.`}
      confirmLabel="Видалити"
      variant="destructive"
      onConfirm={async () => {
        await deleteMutation.mutateAsync({ organizationId });
      }}
    />
  );
};
